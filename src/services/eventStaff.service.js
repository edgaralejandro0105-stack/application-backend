const { EventStaff, Employee, Role } = require('../models');
const AppError = require('../utils/AppError');

class EventStaffService {
  async createEventStaff(data) {
    return await EventStaff.create(data);
  }

  async getAllEventStaff() {
    return await EventStaff.findAll({
      include: [
        { model: Employee, attributes: ['name', 'last_name', 'phone'] },
        { model: Role, attributes: ['name'] }
      ]
    });
  }

  async getEventStaffById(id) {
    const staff = await EventStaff.findByPk(id, {
      include: [
        { model: Employee, attributes: ['name', 'last_name'] },
        { model: Role, attributes: ['name'] }
      ]
    });
    if (!staff) throw new AppError('Asignación de staff no encontrada', 404);
    return staff;
  }

  async getStaffByEvent(eventId) {
    return await EventStaff.findAll({
      where: { event_id: eventId },
      include: [
        { model: Employee, attributes: ['name', 'last_name', 'phone'] },
        { model: Role, attributes: ['name'] }
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
