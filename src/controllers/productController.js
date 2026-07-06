const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

exports.createProduct = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image_url = req.file.path;
  }
  const product = await productService.createProduct(req.body);
  res.status(201).json({ message: 'Producto creado correctamente', data: product });
});

exports.getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json(result);
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json(product);
});

exports.updateProduct = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image_url = req.file.path;
  }
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ message: 'Producto actualizado', data: product });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ message: 'Producto movido a la papelera' });
});

exports.restoreProduct = catchAsync(async (req, res) => {
  await productService.restoreProduct(req.params.id);
  res.status(200).json({ message: 'Producto restaurado correctamente' });
});

