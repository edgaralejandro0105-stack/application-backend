const { Op } = require('sequelize');
const { Event, Client, Venue } = require('../models');
const AppError = require('../utils/AppError');

const EVENT_INCLUDE = [
  { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone'] },
  { model: Venue, attributes: ['name'] }
];

class EventService {
  async getAllEvents(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.status) where.status = query.status;
    if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };

    const result = await Event.findAndCountAll({
      where, limit, offset,
      include: EVENT_INCLUDE,
      order: [['start_date', 'ASC']]
    });
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async createEvent(data) {
    return await Event.create(data);
  }

  async getEventById(id) {
    const event = await Event.findByPk(id, { include: EVENT_INCLUDE });
    if (!event) throw new AppError('Evento no encontrado', 404);
    return event;
  }

  async updateEvent(id, data) {
    const event = await Event.findByPk(id);
    if (!event) throw new AppError('Evento no encontrado', 404);
    await event.update(data);
    return event;
  }

  async deleteEvent(id) {
    const event = await Event.findByPk(id);
    if (!event) throw new AppError('Evento no encontrado', 404);
    await event.destroy();
    return true;
  }
}

module.exports = new EventService();
