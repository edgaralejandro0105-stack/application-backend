const { Provider } = require('../models');

class ProviderService {
  async getAll(query = {}) {
    const { status } = query;
    const where = {};
    if (status) where.status = status;

    return await Provider.findAndCountAll({
      where,
      order: [['create_at', 'DESC']]
    });
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
