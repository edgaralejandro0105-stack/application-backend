const crypto = require('crypto');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers(query = {}) {
    const { Op } = require('sequelize');
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const whereCondition = query.deleted === 'true' 
      ? { is_active: false } 
      : { is_active: { [Op.not]: false } };

    if (query.search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { email: { [Op.iLike]: `%${query.search}%` } }
      ];
    }

    const result = await User.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      attributes: { exclude: ['password'] },
      include: [{ model: Role, attributes: ['role_name', 'access'] }]
    });

    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, attributes: ['role_name', 'access'] }]
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  }

  async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const updateData = { ...data };
    
    if (updateData.password) {
      updateData.password = this.hashPassword(updateData.password);
    }

    await user.update(updateData);
    return user;
  }

  async updatePassword(id, data) {
    const { currentPassword, newPassword } = data;
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (user.password !== this.hashPassword(currentPassword)) {
      throw new AppError('La contraseña actual no es correcta', 400);
    }

    user.password = this.hashPassword(newPassword);
    await user.save();
    return true;
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    await user.update({ is_active: false, deleted_at: new Date() });
    return true;
  }

  async restoreUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    await user.update({ is_active: true, deleted_at: null });
    return true;
  }
}

module.exports = new UserService();
