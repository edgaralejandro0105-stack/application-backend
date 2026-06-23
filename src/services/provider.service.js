const { Op } = require('sequelize');
const { Provider } = require('../models');

class ProviderService {
  async getAll(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { status, search } = query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const result = await Provider.findAndCountAll({
      where,
      limit,
      offset,
      order: [['create_at', 'DESC']]
    });

    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getById(id) {
    const provider = await Provider.findByPk(id);
    if (!provider) {
      throw new Error('Proveedor no encontrado');
    }
    return provider;
  }

  async create(data) {
    return await Provider.create(data);
  }

  async update(id, data) {
    const provider = await this.getById(id);
    return await provider.update(data);
  }

  async delete(id) {
    const provider = await this.getById(id);
    await provider.update({ status: 'inactive' });
    return provider;
  }
}

module.exports = new ProviderService();
