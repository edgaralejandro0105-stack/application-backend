const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const validateSchema = require('../middleware/validateSchema');
const { createVenueSchema } = require('../schemas/venue.schema');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

// URL base: /api/venues
router.post('/', upload.single('image'), validateSchema(createVenueSchema), venueController.createVenue);
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);
router.put('/:id', upload.single('image'), venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);

module.exports = router;
