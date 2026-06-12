const eventService = require('../services/event.service');
const emailService = require('../services/email.service');
const reportService = require('../services/report.service');
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

  // Notificación por Correo (Deshabilitado en backend porque ahora se envía desde el Frontend usando EmailJS debido al bloqueo SMTP de Render)
  /*
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lacasona.com').trim();
  const adminUrl = (process.env.FRONTEND_URL || 'http://localhost:3001').trim();
  
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

  // Notificación al Cliente
  if (req.body.contacto?.correo) {
    emailService.sendEmail({
      to: req.body.contacto.correo,
      subject: 'Hemos recibido tu solicitud - La Casona Eventos',
      templateName: 'client-received',
      context: {
        nombre: req.body.contacto.nombre || 'Cliente',
        telefono: req.body.contacto.telefono || 'N/A',
        fecha: req.body.fecha ? req.body.fecha.split('-').reverse().join('/') : 'N/A',
        salon: req.body.salon || 'N/A',
        horario: req.body.horario || 'N/A',
        tipo: req.body.tipo || 'N/A'
      }
    }).catch(err => console.error('Error enviando correo de confirmación al cliente:', err));
  }
  */

  res.status(201).json({ message: 'Pre-reserva web creada correctamente', data: newEvent });
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
  res.status(200).json({ message: 'Evento eliminado de la base de datos' });
});

exports.getWebsiteReservationStatus = catchAsync(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'El correo electrónico es obligatorio' });
  }
  const result = await eventService.getWebsiteReservationStatus(email);
  res.status(200).json(result);
});