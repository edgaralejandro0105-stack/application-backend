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

  async getAllEventItems() {
    return await EventItem.findAll({ include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }] });
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
