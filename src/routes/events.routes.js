const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const validateSchema = require('../middleware/validateSchema');
const { createEventSchema, createWebsiteReservationSchema } = require('../schemas/event.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.get('/', cacheMiddleware(60, 'events'), eventController.getAllEvents);
router.post('/website', validateSchema(createWebsiteReservationSchema), eventController.createWebsiteReservation);
router.get('/website/status', cacheMiddleware(60, 'events'), eventController.getWebsiteReservationStatus);

router.use(verifyToken);

router.post('/', requireRoles('Gerente', 'Ventas'), validateSchema(createEventSchema), eventController.createEvent);
router.get('/:id', requireRoles('Gerente', 'Ventas', 'Staff'), cacheMiddleware(60, 'events'), eventController.getEventById);
router.put('/:id', requireRoles('Gerente', 'Ventas'), eventController.updateEvent);
router.patch('/:id', requireRoles('Gerente', 'Ventas'), eventController.updateEvent);
router.delete('/:id', requireRoles('Gerente', 'Ventas'), eventController.deleteEvent);
router.put('/:id/restore', requireRoles('Gerente', 'Ventas'), eventController.restoreEvent);

module.exports = router;
