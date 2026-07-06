const { Op } = require('sequelize');
const { Client } = require('../models');
const AppError = require('../utils/AppError');

class ClientService {
  async createClient(data) {
    return await Client.create(data);
  }

  async getAllClients(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { last_name: { [Op.iLike]: `%${query.search}%` } },
        { doc_id: { [Op.iLike]: `%${query.search}%` } }
      ];
    }

    const options = { where, limit, offset, order: [['created_at', 'DESC']] };
    if (query.deleted === 'true') {
      where.is_active = false;
    } else {
      where.is_active = { [Op.not]: false };
    }

    const result = await Client.findAndCountAll(options);
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getClientById(id) {
    const client = await Client.findByPk(id);
    if (!client) throw new AppError('Cliente no encontrado', 404);
    return client;
  }

  async updateClient(id, data) {
    const client = await Client.findByPk(id);
    if (!client) throw new AppError('Cliente no encontrado', 404);
    await client.update(data);
    return client;
  }

  async deleteClient(id) {
    const client = await Client.findByPk(id);
    if (!client) throw new AppError('Cliente no encontrado', 404);
    await client.update({ is_active: false, deleted_at: new Date() });
    return true;
  }

  async restoreClient(id) {
    const client = await Client.findByPk(id);
    if (!client) throw new AppError('Cliente no encontrado', 404);
    await client.update({ is_active: true, deleted_at: null });
    return true;
  }
}

module.exports = new ClientService();
