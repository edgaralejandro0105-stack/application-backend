const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateSchema = require('../middleware/validateSchema');
const { createProductSchema } = require('../schemas/product.schema');

// URL base: /api/products
router.post('/', validateSchema(createProductSchema), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
