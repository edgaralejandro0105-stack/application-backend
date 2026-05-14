// Express es el framework web que usamos para crear el servidor
const express = require('express');
// Creamos un "Enrutador" que es como un mini-servidor enfocado solo en ciertas rutas
const router = express.Router(); 
// Importamos el controlador, que tiene la lógica que se ejecutará cuando visiten estas rutas
const eventController = require('../controllers/eventController');
const validateSchema = require('../middleware/validateSchema');
const { createEventSchema } = require('../schemas/event.schema');

// URL base: /api/events
// POST: Crea un nuevo evento validando primero los datos con Zod
router.post('/', validateSchema(createEventSchema), eventController.createEvent);
router.get('/', eventController.getAllEvents);       // GET: Pide todos los eventos
router.get('/:id', eventController.getEventById);    // GET (con /:id): Pide un evento en específico usando su ID
router.put('/:id', eventController.updateEvent);     // PUT: Actualiza/Modifica un evento existente por ID
router.patch('/:id', eventController.updateEvent);   // PATCH: Actualización parcial
router.delete('/:id', eventController.deleteEvent);  // DELETE: Elimina el evento que coincida con el ID

module.exports = router;
