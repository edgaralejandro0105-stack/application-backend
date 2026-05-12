const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const validateSchema = require('../middleware/validateSchema');
const { createSaleSchema } = require('../schemas/sale.schema');

// URL base: /api/sales
router.post('/', validateSchema(createSaleSchema), saleController.createSale);
router.get('/', saleController.getAllSales);
router.get('/:id', saleController.getSaleById);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
