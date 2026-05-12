const { Op } = require('sequelize');
const { Sale, SaleDetail, Product } = require('../models');
const AppError = require('../utils/AppError');

class SaleService {
  async createSale(data) {
    return await Sale.create(data);
  }

  async getAllSales(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.event_id) where.event_id = query.event_id;

    const result = await Sale.findAndCountAll({ where, limit, offset, order: [['create_at', 'DESC']] });
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getSaleById(id) {
    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleDetail, include: [{ model: Product, attributes: ['name', 'category'] }] }]
    });
    if (!sale) throw new AppError('Venta no encontrada', 404);
    return sale;
  }

  async updateSale(id, data) {
    const sale = await Sale.findByPk(id);
    if (!sale) throw new AppError('Venta no encontrada', 404);
    await sale.update(data);
    return sale;
  }

  async deleteSale(id) {
    const sale = await Sale.findByPk(id);
    if (!sale) throw new AppError('Venta no encontrada', 404);
    await sale.destroy();
    return true;
  }
}

module.exports = new SaleService();
