const inventoryService = require('../services/inventory.service');
const catchAsync = require('../utils/catchAsync');

exports.createInventoryItem = catchAsync(async (req, res) => {
  const item = await inventoryService.createInventoryItem(req.body);
  res.status(201).json({ message: 'Registro de inventario creado', data: item });
});

exports.getAllInventoryItems = catchAsync(async (req, res) => {
  const result = await inventoryService.getAllInventoryItems(req.query);
  res.status(200).json(result);
});

exports.getInventoryItemById = catchAsync(async (req, res) => {
  const item = await inventoryService.getInventoryItemById(req.params.id);
  res.status(200).json(item);
});

exports.updateInventoryItem = catchAsync(async (req, res) => {
  const item = await inventoryService.updateInventoryItem(req.params.id, req.body);
  res.status(200).json({ message: 'Registro de inventario actualizado', data: item });
});

exports.deleteInventoryItem = catchAsync(async (req, res) => {
  await inventoryService.deleteInventoryItem(req.params.id);
  res.status(200).json({ message: 'Registro de inventario eliminado' });
});
