const { ServiceExternal } = require('../models');
const AppError = require('../utils/AppError');

class ServiceExternalService {
  async createServiceExternal(data) {
    return await ServiceExternal.create(data);
  }

  async getAllServiceExternal() {
    return await ServiceExternal.findAll({ order: [['create_at', 'DESC']] });
  }

  async getServiceExternalById(id) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    return service;
  }

  async getServicesByEvent(eventId) {
    return await ServiceExternal.findAll({ where: { event_id: eventId } });
  }

  async updateServiceExternal(id, data) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    await service.update(data);
    return service;
  }

  async deleteServiceExternal(id) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    await service.destroy();
    return true;
  }
}

module.exports = new ServiceExternalService();
