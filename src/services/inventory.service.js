const { Op } = require('sequelize');
const { InventoryBar } = require('../models');
const AppError = require('../utils/AppError');

class InventoryService {
  async createInventoryItem(data) {
    return await InventoryBar.create(data);
  }

  async getAllInventoryItems(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.movement_type) where.movement_type = query.movement_type;

    const result = await InventoryBar.findAndCountAll({ where, limit, offset, order: [['create_at', 'DESC']] });
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
