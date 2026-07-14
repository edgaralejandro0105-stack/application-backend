const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validateSchema = require('../middleware/validateSchema');
const { createClientSchema } = require('../schemas/client.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

router.post('/', validateSchema(createClientSchema), clientController.createClient);
router.get('/', cacheMiddleware(120, 'clients'), clientController.getAllClients);
router.get('/:id', cacheMiddleware(120, 'clients'), clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.patch('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.put('/:id/restore', clientController.restoreClient);

module.exports = router;
