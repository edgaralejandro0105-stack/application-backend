const { Op } = require('sequelize');
const { InventoryBar, Product, User } = require('../models');
const AppError = require('../utils/AppError');

class InventoryService {
  async createInventoryItem(data) {
    const Product = require('../models/Product.model');
    const product = await Product.findByPk(data.product_id);
    
    if (product) {
      // Si el movimiento no trae precio, tomamos el del catálogo para guardar el registro histórico
      if (data.unit_price === undefined || data.unit_price === null) {
        data.unit_price = product.unit_price;
      }
      
      const quantity = parseFloat(data.quantity);
      if (data.movement_type === 'Entry') {
        product.current_stock = parseFloat(product.current_stock || 0) + quantity;
      } else if (data.movement_type === 'Exit') {
        product.current_stock = parseFloat(product.current_stock || 0) - quantity;
      } else if (data.movement_type === 'Adjustment') {
        product.current_stock = quantity;
      }
      await product.save();
    }
    
    const item = await InventoryBar.create(data);
    return item;
  }

  async getAllInventoryItems(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.movement_type && query.movement_type !== 'All') {
      where.movement_type = query.movement_type;
    }
    
    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.date = { [Op.between]: [start, end] };
    } else if (query.startDate) {
      where.date = { [Op.gte]: new Date(query.startDate) };
    } else if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.date = { [Op.lte]: end };
    }

    const include = [
      {
        model: Product,
        attributes: ['name']
      },
      {
        model: User,
        attributes: ['name']
      }
    ];

    if (query.search) {
      where['$Product.name$'] = { [Op.iLike]: `%${query.search}%` };
    }

    const result = await InventoryBar.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date', 'DESC']],
      include
    });
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
