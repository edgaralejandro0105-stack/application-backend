const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateSchema = require('../middleware/validateSchema');
const { createProductSchema, updateProductSchema } = require('../schemas/product.schema');
const upload = require('../middleware/uploadMiddleware');

// URL base: /api/products
router.post('/', upload.single('image'), validateSchema(createProductSchema), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), validateSchema(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
