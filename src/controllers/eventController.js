const eventService = require('../services/event.service');
const emailService = require('../services/email.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllEvents = catchAsync(async (req, res) => {
  const result = await eventService.getAllEvents(req.query);
  res.status(200).json(result);
});

exports.createEvent = catchAsync(async (req, res) => {
  const newEvent = await eventService.createEvent(req.body);

  res.status(201).json({ message: 'Evento creado correctamente', data: newEvent });
});

exports.createWebsiteReservation = catchAsync(async (req, res) => {
  const newEvent = await eventService.createWebsiteReservation(req.body);

  // Notificación por Socket.io
  const io = req.app.get('io');
  if (io) {
    io.emit('new_reservation', newEvent.toJSON ? newEvent.toJSON() : newEvent);
  }

  // Notificación por Correo
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lacasona.com';
  const adminUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  emailService.sendEmail({
    to: adminEmail,
    subject: '¡Nueva Pre-reserva Web Recibida!',
    templateName: 'new-reservation',
    context: {
      nombre: req.body.contacto?.nombre || 'Desconocido',
      telefono: req.body.contacto?.telefono || 'N/A',
      fecha: req.body.fecha ? req.body.fecha.split('-').reverse().join('/') : 'N/A',
      salon: req.body.salon || 'N/A',
      horario: req.body.horario || 'N/A',
      tipo: req.body.tipo || 'N/A',
      adminUrl
    }
  }).catch(err => console.error('Error enviando correo de nueva reserva web:', err));

  res.status(201).json({ message: 'Pre-reserva web creada correctamente', data: newEvent });
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