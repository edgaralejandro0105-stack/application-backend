const eventService = require('../services/event.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllEvents = catchAsync(async (req, res) => {
  const result = await eventService.getAllEvents(req.query);
  res.status(200).json(result);
});

exports.createEvent = catchAsync(async (req, res) => {
  const newEvent = await eventService.createEvent(req.body);
  res.status(201).json({ message: 'Evento creado correctamente', data: newEvent });
});

exports.getEventById = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json(event);
});

exports.updateEvent = catchAsync(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({ message: 'Evento actualizado correctamente', data: event });
});

exports.deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(200).json({ message: 'Evento eliminado de la base de datos' });
});