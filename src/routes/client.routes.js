const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validateSchema = require('../middleware/validateSchema');
const { createClientSchema } = require('../schemas/client.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRoles('Gerente', 'Ventas'));

// URL base: /api/clients
router.post('/', validateSchema(createClientSchema), clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.patch('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
