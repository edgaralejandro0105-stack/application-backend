const { Op } = require('sequelize');
const { Venue } = require('../models');
const AppError = require('../utils/AppError');
const { invalidateTags } = require('../utils/cacheInvalidator');

class VenueService {
  async getAllVenues(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.deleted === 'true') {
      where.is_active = false;
    } else {
      where.is_active = true;
    }
    
    if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };

    const options = { where, limit, offset, order: [['name', 'ASC']] };

    const result = await Venue.findAndCountAll(options);
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async createVenue(data) {
    const venue = await Venue.create(data);
    await invalidateTags(['venues', 'events', 'dashboard']);
    return venue;
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
    await invalidateTags(['venues', 'events', 'dashboard']);
    return venue;
  }

  async deleteVenue(id) {
    const venue = await Venue.findByPk(id);
    if (!venue) throw new AppError('Salón no encontrado', 404);
    await venue.update({ is_active: false, deleted_at: new Date() });
    await invalidateTags(['venues', 'events', 'dashboard']);
    return true;
  }

  async restoreVenue(id) {
    const venue = await Venue.findByPk(id);
    if (!venue) throw new AppError('Salón no encontrado', 404);
    await venue.update({ is_active: true, deleted_at: null });
    await invalidateTags(['venues', 'events', 'dashboard']);
    return true;
  }
}

module.exports = new VenueService();
