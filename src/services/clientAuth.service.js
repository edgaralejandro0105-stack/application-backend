const jwt = require('jsonwebtoken');
const { Client, Event, Venue, EventMilestone, Sale } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class ClientAuthService {
  async login(email, password) {
    const trimmedEmail = email.trim().toLowerCase();
    
    // 1. Find Client by email
    const client = await Client.findOne({ where: { email: trimmedEmail } });
    if (!client) {
      throw new AppError('Credenciales inválidas. Verifica tu correo.', 401);
    }

    // 2. Validate Password (Capital Initial + doc_id)
    // Name: "Juan Perez" -> Initial: "J"
    // Doc ID: "V-12345678" or "12345678" -> password should be "J" + doc_id
    // But wait, the doc_id could be stored with V- or just numbers. We just use the raw doc_id.
    const initial = client.name ? client.name.charAt(0).toUpperCase() : '';
    const rawDocId = client.doc_id ? client.doc_id.replace(/\D/g, '') : ''; // Keep only numbers if the user said "se guarda sin la letra v, si es juan la clave seria J12345678"
    
    // Wait, let's use the exact doc_id since the user said it is saved without 'v'
    const expectedPassword = `${initial}${client.doc_id}`;
    
    // Also accept just numbers if doc_id already has numbers, or fallback to regex
    const expectedPasswordNumbersOnly = `${initial}${rawDocId}`;

    if (password !== expectedPassword && password !== expectedPasswordNumbersOnly) {
      throw new AppError('Credenciales inválidas. Recuerda: Tu clave es la Inicial de tu nombre en mayúscula seguida de tu número de documento.', 401);
    }

    // 3. Generate Token
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
    // Verify ownership
    const event = await Event.findOne({ where: { event_id: eventId, client_id: clientId } });
    if (!event) {
      throw new AppError('Evento no encontrado o acceso no autorizado', 404);
    }

    const milestones = await EventMilestone.findAll({
      where: { event_id: eventId },
      order: [['due_date', 'ASC'], ['milestone_id', 'ASC']]
    });
    return milestones;
  }

  async getMyInvoices(clientId) {
    // Sales where event belongs to this client
    const sales = await Sale.findAll({
      include: [{
        model: Event,
        where: { client_id: clientId },
        attributes: ['event_id', 'start_date', 'type_event']
      }],
      order: [['create_at', 'DESC']]
    });
    return sales;
  }
}

module.exports = new ClientAuthService();
