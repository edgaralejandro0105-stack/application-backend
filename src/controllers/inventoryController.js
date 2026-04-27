const InventoryBar = require('../models/InventoryBar.model');

exports.createInventoryItem = async (req, res) => {
  try {
    const item = await InventoryBar.create(req.body);
    res.status(201).json({ message: 'Registro de inventario creado', data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllInventoryItems = async (req, res) => {
  try {
    const items = await InventoryBar.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryBar.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Registro de inventario no encontrado' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryBar.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Registro de inventario no encontrado' });
    }
    await item.update(req.body);
    res.status(200).json({ message: 'Registro de inventario actualizado', data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryBar.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Registro de inventario no encontrado' });
    }
    await item.destroy();
    res.status(200).json({ message: 'Registro de inventario eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
