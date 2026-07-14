const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const validateSchema = require('../middleware/validateSchema');
const { createVenueSchema } = require('../schemas/venue.schema');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.get('/', cacheMiddleware(300, 'venues'), venueController.getAllVenues);
router.get('/:id', cacheMiddleware(300, 'venues'), venueController.getVenueById);

router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

router.post('/', upload.single('image'), validateSchema(createVenueSchema), venueController.createVenue);
router.put('/:id', upload.single('image'), venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);
router.put('/:id/restore', venueController.restoreVenue);

module.exports = router;
