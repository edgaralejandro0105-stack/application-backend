const { Op } = require('sequelize');
const { sequelize, Sale, SaleDetail, Product, Employee, Event } = require('../models');
const AppError = require('../utils/AppError');
const { invalidateTags } = require('../utils/cacheInvalidator');

class SaleService {
  async createSale(data) {
    const t = await sequelize.transaction();
    try {
      if (data.employee_id) {
        const employee = await Employee.findByPk(data.employee_id);
        if (!employee) {
          const firstEmployee = await Employee.findOne();
          if (firstEmployee) data.employee_id = firstEmployee.employee_id;
        }
      } else {
        const firstEmployee = await Employee.findOne();
        if (firstEmployee) data.employee_id = firstEmployee.employee_id;
      }

      const sale = await Sale.create(data, { transaction: t });

      if (data.details && data.details.length > 0) {
        const details = data.details.map(item => ({
          sale_id: sale.sale_id,
          product_id: item.product_id,
          quantity: item.quantity,
          subtotal: item.subtotal
        }));
        await SaleDetail.bulkCreate(details, { transaction: t });

        for (const item of data.details) {
          const prod = await Product.findByPk(item.product_id);
          if (prod) {
            prod.current_stock = Math.max(0, prod.current_stock - item.quantity);
            await prod.save({ transaction: t });
          }
        }
      }

      await t.commit();
      await invalidateTags(['dashboard']);
      return sale;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllSales(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.event_id) where.event_id = query.event_id;

    const options = { where, limit, offset, order: [['create_at', 'DESC']], include: [{ model: Event, attributes: ['title', 'start_date', 'type_event'] }] };
    if (query.includeDeleted === 'true') options.paranoid = false;

    const result = await Sale.findAndCountAll(options);
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
    await invalidateTags(['dashboard']);
    return sale;
  }

  async deleteSale(id) {
    const sale = await Sale.findByPk(id);
    if (!sale) throw new AppError('Venta no encontrada', 404);
    await sale.destroy();
    await invalidateTags(['dashboard']);
    return true;
  }
}

module.exports = new SaleService();
