const { EventItem, ServiceExternal } = require('../models');
const AppError = require('../utils/AppError');

class EventItemService {
  async createEventItem(data) {
    if (data.service_id && (data.final_price === undefined || data.final_price === null)) {
      const service = await ServiceExternal.findByPk(data.service_id);
      if (service && service.base_price) {
        data.final_price = service.base_price;
      }
    }
    return await EventItem.create(data);
  }

  async getAllEventItems(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.event_id) where.event_id = query.event_id;
    if (query.service_id) where.service_id = query.service_id;

    const result = await EventItem.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }]
    });

    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getEventItemById(id) {
    const item = await EventItem.findByPk(id, { include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }] });
    if (!item) throw new AppError('Ítem de evento no encontrado', 404);
    return item;
  }

  async getItemsByEvent(eventId) {
    return await EventItem.findAll({
      where: { event_id: eventId },
      include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }]
    });
  }

  async updateEventItem(id, data) {
    const item = await EventItem.findByPk(id);
    if (!item) throw new AppError('Ítem de evento no encontrado', 404);
    await item.update(data);
    return item;
  }

  async deleteEventItem(id) {
    const item = await EventItem.findByPk(id);
    if (!item) throw new AppError('Ítem de evento no encontrado', 404);
    await item.destroy();
    return true;
  }
}

module.exports = new EventItemService();
