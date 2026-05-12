const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const validateSchema = require('../middleware/validateSchema');
const { createInventoryItemSchema } = require('../schemas/inventory.schema');

// URL base: /api/inventory
router.post('/', validateSchema(createInventoryItemSchema), inventoryController.createInventoryItem);
router.get('/', inventoryController.getAllInventoryItems);
router.get('/:id', inventoryController.getInventoryItemById);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
