const { EventStaff, Employee } = require('../models');
const AppError = require('../utils/AppError');

class EventStaffService {
  async createEventStaff(data) {
    return await EventStaff.create(data);
  }

  async getAllEventStaff(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.event_id) where.event_id = query.event_id;
    if (query.employee_id) where.employee_id = query.employee_id;

    const result = await EventStaff.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Employee, attributes: ['first_name', 'last_name', 'phone'] }
      ]
    });

    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getEventStaffById(id) {
    const staff = await EventStaff.findByPk(id, {
      include: [
        { model: Employee, attributes: ['first_name', 'last_name'] }
      ]
    });
    if (!staff) throw new AppError('Asignación de staff no encontrada', 404);
    return staff;
  }

  async getStaffByEvent(eventId) {
    return await EventStaff.findAll({
      where: { event_id: eventId },
      include: [
        { model: Employee, attributes: ['first_name', 'last_name', 'phone'] }
      ]
    });
  }

  async updateEventStaff(id, data) {
    const staff = await EventStaff.findByPk(id);
    if (!staff) throw new AppError('Asignación de staff no encontrada', 404);
    await staff.update(data);
    return staff;
  }

  async deleteEventStaff(id) {
    const staff = await EventStaff.findByPk(id);
    if (!staff) throw new AppError('Asignación de staff no encontrada', 404);
    await staff.destroy();
    return true;
  }
}

module.exports = new EventStaffService();
