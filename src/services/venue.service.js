const { Op } = require('sequelize');
const { Venue } = require('../models');
const AppError = require('../utils/AppError');

class VenueService {
  async getAllVenues(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };

    const result = await Venue.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async createVenue(data) {
    return await Venue.create(data);
  }

  async getVenueById(id) {
    const venue = await Venue.findByPk(id);
    if (!venue) throw new AppError('Salón no encontrado', 404);
    return venue;
  }

  async updateVenue(id, data) {
    const venue = await Venue.findByPk(id);
    if (!venue) throw new AppError('Salón no encontrado', 404);
    await venue.update(data);
    return venue;
  }

  async deleteVenue(id) {
    const venue = await Venue.findByPk(id);
    if (!venue) throw new AppError('Salón no encontrado', 404);
    await venue.destroy();
    return true;
  }
}

module.exports = new VenueService();
