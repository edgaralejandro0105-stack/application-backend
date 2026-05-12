const { Op } = require('sequelize');
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

    const products = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_at', 'DESC']]
    });

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
