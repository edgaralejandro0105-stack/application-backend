const eventStaffService = require('../services/eventStaff.service');
const catchAsync = require('../utils/catchAsync');

exports.createEventStaff = catchAsync(async (req, res) => {
  const staff = await eventStaffService.createEventStaff(req.body);
  res.status(201).json({ message: 'Asignación de staff creada', data: staff });
});

exports.getAllEventStaff = catchAsync(async (req, res) => {
  const staff = await eventStaffService.getAllEventStaff(req.query);
  res.status(200).json(staff);
});

exports.getEventStaffById = catchAsync(async (req, res) => {
  const staff = await eventStaffService.getEventStaffById(req.params.id);
  res.status(200).json(staff);
});

exports.getStaffByEvent = catchAsync(async (req, res) => {
  const staff = await eventStaffService.getStaffByEvent(req.params.eventId);
  res.status(200).json(staff);
});

exports.updateEventStaff = catchAsync(async (req, res) => {
  const staff = await eventStaffService.updateEventStaff(req.params.id, req.body);
  res.status(200).json({ message: 'Asignación de staff actualizada', data: staff });
});

exports.deleteEventStaff = catchAsync(async (req, res) => {
  await eventStaffService.deleteEventStaff(req.params.id);
  res.status(200).json({ message: 'Asignación de staff eliminada' });
});
