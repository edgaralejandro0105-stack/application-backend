const express = require('express');
const router = express.Router();
const eventItemController = require('../controllers/eventItemController');

// URL base: /api/event-items
router.post('/', eventItemController.createEventItem);
router.get('/', eventItemController.getAllEventItems);
router.get('/event/:eventId', eventItemController.getItemsByEvent);
router.get('/:id', eventItemController.getEventItemById);
router.put('/:id', eventItemController.updateEventItem);
router.delete('/:id', eventItemController.deleteEventItem);

module.exports = router;
