const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const validateSchema = require('../middleware/validateSchema');
const { createVenueSchema } = require('../schemas/venue.schema');

// URL base: /api/venues
router.post('/', validateSchema(createVenueSchema), venueController.createVenue);
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);
router.put('/:id', venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);

module.exports = router;
