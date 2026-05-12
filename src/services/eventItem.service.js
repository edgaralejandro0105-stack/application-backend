const { EventItem, Product } = require('../models');
const AppError = require('../utils/AppError');

class EventItemService {
  async createEventItem(data) {
    return await EventItem.create(data);
  }

  async getAllEventItems() {
    return await EventItem.findAll({ include: [{ model: Product, attributes: ['name', 'category', 'measurement_unit'] }] });
  }

  async getEventItemById(id) {
    const item = await EventItem.findByPk(id, { include: [{ model: Product, attributes: ['name', 'category'] }] });
    if (!item) throw new AppError('Ítem de evento no encontrado', 404);
    return item;
  }

  async getItemsByEvent(eventId) {
    return await EventItem.findAll({
      where: { event_id: eventId },
      include: [{ model: Product, attributes: ['name', 'category', 'measurement_unit'] }]
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
