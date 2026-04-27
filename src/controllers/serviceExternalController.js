const ServiceExternal = require('../models/ServiceExternal.model');

exports.createServiceExternal = async (req, res) => {
  try {
    const service = await ServiceExternal.create(req.body);
    res.status(201).json({ message: 'Servicio externo creado', data: service });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllServiceExternal = async (req, res) => {
  try {
    const services = await ServiceExternal.findAll();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceExternalById = async (req, res) => {
  try {
    const service = await ServiceExternal.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio externo no encontrado' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServicesByEvent = async (req, res) => {
  try {
    const services = await ServiceExternal.findAll({ where: { event_id: req.params.eventId } });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateServiceExternal = async (req, res) => {
  try {
    const service = await ServiceExternal.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio externo no encontrado' });
    }
    await service.update(req.body);
    res.status(200).json({ message: 'Servicio externo actualizado', data: service });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteServiceExternal = async (req, res) => {
  try {
    const service = await ServiceExternal.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Servicio externo no encontrado' });
    }
    await service.destroy();
    res.status(200).json({ message: 'Servicio externo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
