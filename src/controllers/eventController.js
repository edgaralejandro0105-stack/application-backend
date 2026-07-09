const eventService = require('../services/event.service');
const emailService = require('../services/email.service');
const reportService = require('../services/report.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllEvents = catchAsync(async (req, res) => {
  const result = await eventService.getAllEvents(req.query, req.user);
  res.status(200).json(result);
});

exports.createEvent = catchAsync(async (req, res) => {
  const newEvent = await eventService.createEvent(req.body);

  res.status(201).json({ message: 'Evento creado correctamente', data: newEvent });
});

exports.createWebsiteReservation = catchAsync(async (req, res) => {
  const result = await eventService.createWebsiteReservation(req.body);
  const { event: newEvent, sale } = result;

  // Notificación por Socket.io
  const io = req.app.get('io');
  if (io) {
    io.emit('new_reservation', newEvent.toJSON ? newEvent.toJSON() : newEvent);
  }

  // Notificación en Base de Datos
  const { Notification } = require('../models');
  try {
    const newNotification = await Notification.create({
      user_id: null,
      title: 'Nueva Reservación Web',
      message: `Has recibido una nueva pre-reserva de ${req.body.contacto?.nombre || 'Desconocido'} para el ${req.body.fecha ? req.body.fecha.split('-').reverse().join('/') : 'N/A'}.`,
      type: 'info',
      read: false
    });
    if (io) {
      io.emit('new_notification', newNotification);
    }
  } catch (err) {
    console.error('Error al guardar notificación en BD:', err);
  }

  res.status(201).json({
    message: 'Pre-reserva web creada correctamente',
    data: newEvent,
    sale
  });
});

exports.getEventById = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json(event);
});

exports.updateEvent = catchAsync(async (req, res) => {
  const oldEvent = await eventService.getEventById(req.params.id);
  const event = await eventService.updateEvent(req.params.id, req.body);
  
  // Si se confirmó el evento y no estaba confirmado antes
  if (oldEvent.status !== 'Confirmed' && req.body.status === 'Confirmed') {
    // Obtenemos el evento con todas sus relaciones (Cliente, Salón, Servicios)
    const fullEvent = await eventService.getEventById(req.params.id);
    
    // Si el cliente tiene correo, generamos PDF y enviamos
    if (fullEvent.Client && fullEvent.Client.email) {
      reportService.generateEventContractPDF(fullEvent).then(pdfBuffer => {
        const fechaFormat = new Date(fullEvent.start_date).toLocaleDateString('es-ES', { dateStyle: 'long' });
        
        emailService.sendEmail({
          to: fullEvent.Client.email,
          subject: '¡Tu evento en La Casona ha sido Confirmado!',
          templateName: 'event-confirmed',
          context: {
            nombre: fullEvent.Client.name,
            salon: fullEvent.Venue?.name || 'Salón Principal',
            fecha: fechaFormat,
            tipo: fullEvent.type_event || 'Evento General'
          },
          attachments: [
            {
              filename: `Confirmacion_Evento_${fullEvent.event_id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        }).catch(err => console.error('Error enviando correo de confirmación al cliente:', err));
      }).catch(err => console.error('Error generando PDF del contrato:', err));
    }
  }

  res.status(200).json({ message: 'Evento actualizado correctamente', data: event });
});

exports.deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(200).json({ message: 'Evento movido a la papelera' });
});

exports.restoreEvent = catchAsync(async (req, res) => {
  await eventService.restoreEvent(req.params.id);
  res.status(200).json({ message: 'Evento restaurado correctamente' });
});

exports.getWebsiteReservationStatus = catchAsync(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'El correo electrónico es obligatorio' });
  }
  const result = await eventService.getWebsiteReservationStatus(email);
  res.status(200).json(result);
});