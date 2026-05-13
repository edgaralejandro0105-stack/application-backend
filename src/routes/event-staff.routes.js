const express = require('express');
const router = express.Router();
const eventStaffController = require('../controllers/eventStaffController');

// URL base: /api/event-staff
router.post('/', eventStaffController.createEventStaff);
router.get('/', eventStaffController.getAllEventStaff);
router.get('/event/:eventId', eventStaffController.getStaffByEvent);
router.get('/:id', eventStaffController.getEventStaffById);
router.put('/:id', eventStaffController.updateEventStaff);
router.delete('/:id', eventStaffController.deleteEventStaff);

module.exports = router;
