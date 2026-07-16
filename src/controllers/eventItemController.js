const eventItemService = require('../services/eventItem.service');
const catchAsync = require('../utils/catchAsync');

exports.createEventItem = catchAsync(async (req, res) => {
  const eventItem = await eventItemService.createEventItem(req.body);
  res.status(201).json({ message: 'Ítem de evento creado', data: eventItem });
});

exports.getAllEventItems = catchAsync(async (req, res) => {
  const items = await eventItemService.getAllEventItems(req.query);
  res.status(200).json(items);
});

exports.getEventItemById = catchAsync(async (req, res) => {
  const item = await eventItemService.getEventItemById(req.params.id);
  res.status(200).json(item);
});

exports.getItemsByEvent = catchAsync(async (req, res) => {
  const items = await eventItemService.getItemsByEvent(req.params.eventId);
  res.status(200).json(items);
});

exports.updateEventItem = catchAsync(async (req, res) => {
  const item = await eventItemService.updateEventItem(req.params.id, req.body);
  res.status(200).json({ message: 'Ítem de evento actualizado', data: item });
});

exports.deleteEventItem = catchAsync(async (req, res) => {
  await eventItemService.deleteEventItem(req.params.id);
  res.status(200).json({ message: 'Ítem de evento eliminado' });
});
