const express = require('express');
const router = express.Router();
const serviceExternalController = require('../controllers/serviceExternalController');

// URL base: /api/service-external
router.post('/', serviceExternalController.createServiceExternal);
router.get('/', serviceExternalController.getAllServiceExternal);
router.get('/event/:eventId', serviceExternalController.getServicesByEvent);
router.get('/:id', serviceExternalController.getServiceExternalById);
router.put('/:id', serviceExternalController.updateServiceExternal);
router.delete('/:id', serviceExternalController.deleteServiceExternal);

module.exports = router;
