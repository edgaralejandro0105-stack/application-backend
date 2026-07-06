const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const validateSchema = require('../middleware/validateSchema');
const { createVenueSchema } = require('../schemas/venue.schema');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

// Rutas públicas (para la web)
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);

// A partir de aquí, protegemos las rutas internas
router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

// URL base: /api/venues
router.post('/', upload.single('image'), validateSchema(createVenueSchema), venueController.createVenue);
router.put('/:id', upload.single('image'), venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);
router.put('/:id/restore', venueController.restoreVenue);

module.exports = router;
