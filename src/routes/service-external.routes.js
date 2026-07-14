const express = require('express');
const router = express.Router();
const serviceExternalController = require('../controllers/serviceExternalController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.get('/', cacheMiddleware(300, 'service-external'), serviceExternalController.getAllServiceExternal);
router.get('/event/:eventId', cacheMiddleware(60, 'events'), serviceExternalController.getServicesByEvent);
router.get('/:id', cacheMiddleware(300, 'service-external'), serviceExternalController.getServiceExternalById);

router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

router.post('/', upload.single('image'), serviceExternalController.createServiceExternal);
router.put('/:id', upload.single('image'), serviceExternalController.updateServiceExternal);
router.delete('/:id', serviceExternalController.deleteServiceExternal);
router.put('/:id/restore', serviceExternalController.restoreServiceExternal);

module.exports = router;
