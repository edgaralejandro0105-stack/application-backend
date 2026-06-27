const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const validateSchema = require('../middleware/validateSchema');
const { createInventoryItemSchema, updateInventoryItemSchema } = require('../schemas/inventory.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRoles('Gerente'));

// URL base: /api/inventory
router.post('/', validateSchema(createInventoryItemSchema), inventoryController.createInventoryItem);
router.get('/', inventoryController.getAllInventoryItems);
router.get('/:id', inventoryController.getInventoryItemById);
router.put('/:id', validateSchema(updateInventoryItemSchema), inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
