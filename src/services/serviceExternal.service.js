const { ServiceExternal } = require('../models');
const AppError = require('../utils/AppError');
const { invalidateTags } = require('../utils/cacheInvalidator');

class ServiceExternalService {
  async createServiceExternal(data) {
    const service = await ServiceExternal.create(data);
    await invalidateTags(['service-external', 'events']);
    return service;
  }

  async getAllServiceExternal(query = {}) {
    const whereCondition = query.deleted === 'true'
      ? { is_active: false }
      : { is_active: true };
      
    return await ServiceExternal.findAll({ 
      where: whereCondition,
      order: [['service_id', 'DESC']] 
    });
  }

  async getServiceExternalById(id) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    return service;
  }

  async getServicesByEvent(eventId) {
    const { EventItem } = require('../models');
    const items = await EventItem.findAll({ 
      where: { event_id: eventId },
      include: [{ model: ServiceExternal }] 
    });
    return items.map(item => item.ServiceExternal).filter(Boolean);
  }

  async updateServiceExternal(id, data) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    await service.update(data);
    await invalidateTags(['service-external', 'events']);
    return service;
  }

  async deleteServiceExternal(id) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    await service.update({ is_active: false, deleted_at: new Date() });
    await invalidateTags(['service-external', 'events']);
    return true;
  }

  async restoreServiceExternal(id) {
    const service = await ServiceExternal.findByPk(id);
    if (!service) throw new AppError('Servicio externo no encontrado', 404);
    await service.update({ is_active: true, deleted_at: null });
    await invalidateTags(['service-external', 'events']);
    return true;
  }
}

module.exports = new ServiceExternalService();
