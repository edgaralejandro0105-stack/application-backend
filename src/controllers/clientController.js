const clientService = require('../services/client.service');
const catchAsync = require('../utils/catchAsync');

exports.createClient = catchAsync(async (req, res) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json({ message: 'Cliente creado correctamente', data: client });
});

exports.getAllClients = catchAsync(async (req, res) => {
  const result = await clientService.getAllClients(req.query);
  res.status(200).json(result);
});

exports.getClientById = catchAsync(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);
  res.status(200).json(client);
});

exports.updateClient = catchAsync(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  res.status(200).json({ message: 'Cliente actualizado correctamente', data: client });
});

exports.deleteClient = catchAsync(async (req, res) => {
  await clientService.deleteClient(req.params.id);
  res.status(200).json({ message: 'Cliente eliminado de la base de datos' });
});

