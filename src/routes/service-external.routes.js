const express = require('express');
const router = express.Router();
const serviceExternalController = require('../controllers/serviceExternalController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

// Rutas públicas (para la web)
router.get('/', serviceExternalController.getAllServiceExternal);
router.get('/event/:eventId', serviceExternalController.getServicesByEvent);
router.get('/:id', serviceExternalController.getServiceExternalById);

// A partir de aquí, protegemos las rutas internas
router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

// URL base: /api/service-external
router.post('/', upload.single('image'), serviceExternalController.createServiceExternal);
router.put('/:id', upload.single('image'), serviceExternalController.updateServiceExternal);
router.delete('/:id', serviceExternalController.deleteServiceExternal);
router.put('/:id/restore', serviceExternalController.restoreServiceExternal);

module.exports = router;
