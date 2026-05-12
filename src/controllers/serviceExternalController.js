const serviceExternalService = require('../services/serviceExternal.service');
const catchAsync = require('../utils/catchAsync');

exports.createServiceExternal = catchAsync(async (req, res) => {
  const service = await serviceExternalService.createServiceExternal(req.body);
  res.status(201).json({ message: 'Servicio externo creado', data: service });
});

exports.getAllServiceExternal = catchAsync(async (req, res) => {
  const services = await serviceExternalService.getAllServiceExternal();
  res.status(200).json(services);
});

exports.getServiceExternalById = catchAsync(async (req, res) => {
  const service = await serviceExternalService.getServiceExternalById(req.params.id);
  res.status(200).json(service);
});

exports.getServicesByEvent = catchAsync(async (req, res) => {
  const services = await serviceExternalService.getServicesByEvent(req.params.eventId);
  res.status(200).json(services);
});

exports.updateServiceExternal = catchAsync(async (req, res) => {
  const service = await serviceExternalService.updateServiceExternal(req.params.id, req.body);
  res.status(200).json({ message: 'Servicio externo actualizado', data: service });
});

exports.deleteServiceExternal = catchAsync(async (req, res) => {
  await serviceExternalService.deleteServiceExternal(req.params.id);
  res.status(200).json({ message: 'Servicio externo eliminado' });
});
