const { Op, Sequelize } = require('sequelize');
const { Product } = require('../models');
const AppError = require('../utils/AppError');

class ProductService {
  async createProduct(data) {
    const product = await Product.create(data);
    return product;
  }

  async getAllProducts(query) {
    // Implementación de paginación y búsqueda
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.search) {
      where.name = {
        [Op.iLike]: `%${query.search}%`
      };
    }
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.stockStatus) {
      if (query.stockStatus === 'Out') {
        where.current_stock = { [Op.lte]: 0 };
      } else if (query.stockStatus === 'Low') {
        where.current_stock = { [Op.lt]: Sequelize.col('min_stock'), [Op.gt]: 0 };
      } else if (query.stockStatus === 'Normal') {
        where.current_stock = { [Op.gte]: Sequelize.col('min_stock') };
      }
    }

    if (query.expiryStatus) {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);
      
      if (query.expiryStatus === 'Expired') {
        where.expiry_date = { [Op.lt]: now };
      } else if (query.expiryStatus === 'Expiring') {
        where.expiry_date = { [Op.gte]: now, [Op.lte]: in30Days };
      } else if (query.expiryStatus === 'Good') {
        where.expiry_date = { [Op.gt]: in30Days };
      }
    }

    let order = [['create_at', 'DESC']];
    if (query.sortBy) {
      if (query.sortBy === 'nameAsc') order = [['name', 'ASC']];
      if (query.sortBy === 'nameDesc') order = [['name', 'DESC']];
      if (query.sortBy === 'stockDesc') order = [['current_stock', 'DESC']];
      if (query.sortBy === 'stockAsc') order = [['current_stock', 'ASC']];
      if (query.sortBy === 'priceDesc') order = [['unit_price', 'DESC']];
      if (query.sortBy === 'priceAsc') order = [['unit_price', 'ASC']];
    }

    const options = {
      where,
      limit,
      offset,
      order
    };
    if (query.includeDeleted === 'true') {
      options.paranoid = false;
    }

    const products = await Product.findAndCountAll(options);

    return {
      total: products.count,
      page,
      limit,
      totalPages: Math.ceil(products.count / limit),
      data: products.rows
    };
  }

  async getProductById(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    return product;
  }

  async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    
    await product.update(data);
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    
    await product.destroy();
    return true;
  }
}

module.exports = new ProductService();
