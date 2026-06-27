const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRoles('Gerente'));

router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProviderById);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

module.exports = router;
