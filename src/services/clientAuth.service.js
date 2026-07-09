const jwt = require('jsonwebtoken');
const { Client, Event, Venue, EventMilestone, Sale, Payment } = require('../models');
const AppError = require('../utils/AppError');
const { Op, fn, col, literal } = require('sequelize');

class ClientAuthService {
  async login(email, password) {
    const trimmedEmail = email.trim().toLowerCase();
    
    const client = await Client.findOne({ where: { email: trimmedEmail } });
    if (!client) {
      throw new AppError('Credenciales inválidas. Verifica tu correo.', 401);
    }

    const initial = client.name ? client.name.charAt(0).toUpperCase() : '';
    const rawDocId = client.doc_id ? client.doc_id.replace(/\D/g, '') : '';
    const expectedPassword = `${initial}${client.doc_id}`;
    const expectedPasswordNumbersOnly = `${initial}${rawDocId}`;

    if (password !== expectedPassword && password !== expectedPasswordNumbersOnly) {
      throw new AppError('Credenciales inválidas. Recuerda: Tu clave es la Inicial de tu nombre en mayúscula seguida de tu número de documento.', 401);
    }

    const payload = {
      client_id: client.client_id,
      email: client.email,
      role: 'Client'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_casona', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    return { client, token };
  }

  async getMyEvents(clientId) {
    const events = await Event.findAll({
      where: { client_id: clientId },
      include: [{ model: Venue, attributes: ['name'], through: { attributes: [] } }],
      order: [['start_date', 'DESC']]
    });
    return events;
  }

  async getEventMilestones(clientId, eventId) {
    const event = await Event.findOne({ where: { event_id: eventId, client_id: clientId } });
    if (!event) {
      throw new AppError('Evento no encontrado o acceso no autorizado', 404);
    }

    let milestones = await EventMilestone.findAll({
      where: { event_id: eventId },
      order: [['due_date', 'ASC'], ['milestone_id', 'ASC']]
    });

    if (milestones.length === 0 && event.status === 'Confirmed') {
      const defaultMilestones = [
        { title: 'Firma de Contrato', description: 'Contrato firmado y depósito recibido', status: 'Completed', due_date: new Date(event.start_date.getTime() - 30 * 24 * 60 * 60 * 1000) },
        { title: 'Selección de Menú', description: 'Definir el menú y los servicios adicionales', status: 'In Progress', due_date: new Date(event.start_date.getTime() - 21 * 24 * 60 * 60 * 1000) },
        { title: 'Confirmación de Invitados', description: 'Número final de invitados confirmado', status: 'Pending', due_date: new Date(event.start_date.getTime() - 14 * 24 * 60 * 60 * 1000) },
        { title: 'Coordinación Final', description: 'Reunión previa para ultimar detalles', status: 'Pending', due_date: new Date(event.start_date.getTime() - 3 * 24 * 60 * 60 * 1000) },
        { title: '¡Evento!', description: 'Día del evento', status: 'Pending', due_date: event.start_date }
      ];

      for (const ms of defaultMilestones) {
        await EventMilestone.create({ event_id: eventId, ...ms });
      }

      milestones = await EventMilestone.findAll({
        where: { event_id: eventId },
        order: [['due_date', 'ASC'], ['milestone_id', 'ASC']]
      });
    }

    return milestones;
  }

  async getMyInvoices(clientId) {
    const sales = await Sale.findAll({
      include: [{
        model: Event,
        where: { client_id: clientId },
        attributes: ['event_id', 'start_date', 'type_event']
      }],
      order: [['create_at', 'DESC']]
    });

    const invoicesWithPayments = await Promise.all(sales.map(async (sale) => {
      const totalPaidResult = await Payment.findAll({
        where: { sale_id: sale.sale_id },
        attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total_paid']]
      });
      const totalPaid = Number(totalPaidResult[0]?.get('total_paid')) || 0;
      const total = Number(sale.total) || 0;
      const balance = total - totalPaid;

      const saleJson = sale.toJSON();
      return {
        ...saleJson,
        total_paid: totalPaid,
        balance: balance,
        computed_status: balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : saleJson.status || 'pending'
      };
    }));

    return invoicesWithPayments;
  }

  async simulatePayment(clientId, saleId, amount, method) {
    const sale = await Sale.findOne({
      where: { sale_id: saleId },
      include: [{ model: Event, where: { client_id: clientId } }]
    });

    if (!sale) {
      throw new AppError('Factura no encontrada o acceso no autorizado', 404);
    }

    const payment = await Payment.create({
      sale_id: saleId,
      amount: amount,
      method: method,
      simulated: true
    });

    const totalPaidResult = await Payment.findAll({
      where: { sale_id: saleId },
      attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total_paid']]
    });
    const totalPaid = Number(totalPaidResult[0].get('total_paid')) || 0;
    const total = Number(sale.total) || 0;
    const balance = total - totalPaid;

    let newStatus = sale.status;
    if (balance <= 0) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }
    await sale.update({ status: newStatus });

    return {
      transaction_id: `SIM-${payment.payment_id}`,
      transaction: payment,
      invoice: {
        sale_id: sale.sale_id,
        reference: sale.reference,
        total: total,
        total_paid: totalPaid,
        balance: balance,
        due_date: sale.due_date,
        status: newStatus
      }
    };
  }

  async getInvoicePayments(clientId, saleId) {
    const sale = await Sale.findOne({
      where: { sale_id: saleId },
      include: [{ model: Event, where: { client_id: clientId } }]
    });
    if (!sale) throw new AppError('Factura no encontrada', 404);

    const payments = await Payment.findAll({
      where: { sale_id: saleId },
      order: [['date', 'DESC']]
    });
    return payments;
  }

  async updateMilestone(clientId, eventId, milestoneId, status) {
    const event = await Event.findOne({ where: { event_id: eventId, client_id: clientId } });
    if (!event) throw new AppError('Evento no encontrado', 404);

    const milestone = await EventMilestone.findOne({ where: { milestone_id: milestoneId, event_id: eventId } });
    if (!milestone) throw new AppError('Hito no encontrado', 404);

    const update = { status };
    if (status === 'Completed') update.completed_at = new Date();
    await milestone.update(update);
    return milestone;
  }
}

module.exports = new ClientAuthService();
