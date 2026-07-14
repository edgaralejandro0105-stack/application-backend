const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateSchema = require('../middleware/validateSchema');
const { createProductSchema, updateProductSchema } = require('../schemas/product.schema');
const upload = require('../middleware/uploadMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.post('/', upload.single('image'), validateSchema(createProductSchema), productController.createProduct);
router.get('/', cacheMiddleware(120, 'products'), productController.getAllProducts);
router.get('/:id', cacheMiddleware(120, 'products'), productController.getProductById);
router.put('/:id', upload.single('image'), validateSchema(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/restore', productController.restoreProduct);

module.exports = router;
