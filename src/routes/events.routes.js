// Express es el framework web que usamos para crear el servidor
const express = require('express');
// Creamos un "Enrutador" que es como un mini-servidor enfocado solo en ciertas rutas
const router = express.Router(); 
// Importamos el controlador, que tiene la lógica que se ejecutará cuando visiten estas rutas
const eventController = require('../controllers/eventController');
const validateSchema = require('../middleware/validateSchema');
const { createEventSchema, createWebsiteReservationSchema } = require('../schemas/event.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

// URL base: /api/events
// POST para pre-reservas de la web (Público)
router.post('/website', validateSchema(createWebsiteReservationSchema), eventController.createWebsiteReservation);

// GET para consultar el estado de la pre-reserva por teléfono (Público)
router.get('/website/status', eventController.getWebsiteReservationStatus);

// A partir de aquí, protegemos las rutas internas
router.use(verifyToken);

// POST: Crea un nuevo evento validando primero los datos con Zod
router.post('/', requireRoles('Gerente', 'Ventas'), validateSchema(createEventSchema), eventController.createEvent);
router.get('/', requireRoles('Gerente', 'Ventas', 'Staff'), eventController.getAllEvents);       // GET: Pide todos los eventos
router.get('/:id', requireRoles('Gerente', 'Ventas', 'Staff'), eventController.getEventById);    // GET (con /:id): Pide un evento en específico usando su ID
router.put('/:id', requireRoles('Gerente', 'Ventas'), eventController.updateEvent);     // PUT: Actualiza/Modifica un evento existente por ID
router.patch('/:id', requireRoles('Gerente', 'Ventas'), eventController.updateEvent);   // PATCH: Actualización parcial
router.delete('/:id', requireRoles('Gerente', 'Ventas'), eventController.deleteEvent);  // DELETE: Elimina el evento que coincida con el ID

module.exports = router;
