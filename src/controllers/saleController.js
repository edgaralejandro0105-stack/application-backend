const saleService = require('../services/sale.service');
const catchAsync = require('../utils/catchAsync');

exports.createSale = catchAsync(async (req, res) => {
  const sale = await saleService.createSale(req.body);
  res.status(201).json({ message: 'Venta creada correctamente', data: sale });
});

exports.getAllSales = catchAsync(async (req, res) => {
  const result = await saleService.getAllSales(req.query);
  res.status(200).json(result);
});

exports.getSaleById = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);
  res.status(200).json(sale);
});

exports.updateSale = catchAsync(async (req, res) => {
  const sale = await saleService.updateSale(req.params.id, req.body);
  res.status(200).json({ message: 'Venta actualizada correctamente', data: sale });
});

exports.deleteSale = catchAsync(async (req, res) => {
  await saleService.deleteSale(req.params.id);
  res.status(200).json({ message: 'Venta eliminada correctamente' });
});
