const { Op } = require('sequelize');
const { Payment, Sale, Event, Client } = require('../models');
const AppError = require('../utils/AppError');

class PaymentService {
  async getAllPayments(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.method) where.method = query.method;
    if (query.simulated !== undefined) where.simulated = query.simulated === 'true';
    if (query.startDate && query.endDate) {
      where.date = {
        [Op.between]: [new Date(query.startDate), new Date(query.endDate)]
      };
    }

    const result = await Payment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date', 'DESC']],
      include: [{
        model: Sale,
        include: [{
          model: Event,
          attributes: ['event_id', 'title', 'type_event', 'start_date', 'status'],
          include: [{ model: Client, attributes: ['name', 'last_name'] }]
        }]
      }]
    });

    return {
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
      data: result.rows
    };
  }

  async getPaymentById(id) {
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Sale,
        include: [{
          model: Event,
          attributes: ['event_id', 'title', 'type_event', 'start_date', 'status'],
          include: [{ model: Client, attributes: ['name', 'last_name'] }]
        }]
      }]
    });
    if (!payment) throw new AppError('Pago no encontrado', 404);
    return payment;
  }
}

module.exports = new PaymentService();
