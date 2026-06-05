const express = require('express');
const router = express.Router();
const serviceExternalController = require('../controllers/serviceExternalController');
const upload = require('../middleware/uploadMiddleware');

// URL base: /api/service-external
router.post('/', upload.single('image'), serviceExternalController.createServiceExternal);
router.get('/', serviceExternalController.getAllServiceExternal);
router.get('/event/:eventId', serviceExternalController.getServicesByEvent);
router.get('/:id', serviceExternalController.getServiceExternalById);
router.put('/:id', upload.single('image'), serviceExternalController.updateServiceExternal);
router.delete('/:id', serviceExternalController.deleteServiceExternal);

module.exports = router;
