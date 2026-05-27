const { Op } = require('sequelize');
const { InventoryBar } = require('../models');
const AppError = require('../utils/AppError');

class InventoryService {
  async createInventoryItem(data) {
    const item = await InventoryBar.create(data);
    const Product = require('../models/Product.model');
    const product = await Product.findByPk(data.product_id);
    if (product) {
      const quantity = parseFloat(data.quantity);
      if (data.movement_type === 'Entry') {
        product.current_stock = parseFloat(product.current_stock || 0) + quantity;
      } else if (data.movement_type === 'Exit') {
        product.current_stock = parseFloat(product.current_stock || 0) - quantity;
      } else if (data.movement_type === 'Adjustment') {
        product.current_stock = quantity;
      }
      if (data.unit_price) {
        product.unit_price = parseFloat(data.unit_price);
      }
      await product.save();
    }
    return item;
  }

  async getAllInventoryItems(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.movement_type) where.movement_type = query.movement_type;

    const result = await InventoryBar.findAndCountAll({ where, limit, offset, order: [['date', 'DESC']] });
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getInventoryItemById(id) {
    const item = await InventoryBar.findByPk(id);
    if (!item) throw new AppError('Registro de inventario no encontrado', 404);
    return item;
  }

  async updateInventoryItem(id, data) {
    const item = await InventoryBar.findByPk(id);
    if (!item) throw new AppError('Registro de inventario no encontrado', 404);
    await item.update(data);
    return item;
  }

  async deleteInventoryItem(id) {
    const item = await InventoryBar.findByPk(id);
    if (!item) throw new AppError('Registro de inventario no encontrado', 404);
    await item.destroy();
    return true;
  }
}

module.exports = new InventoryService();
