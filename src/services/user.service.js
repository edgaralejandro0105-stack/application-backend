const crypto = require('crypto');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers() {
    const { Op } = require('sequelize');
    return await User.findAll({
      where: { 
        is_active: {
          [Op.not]: false
        }
      },
      attributes: { exclude: ['password'] },
      include: [{ model: Role, attributes: ['role_name', 'access'] }]
    });
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
    await user.update({ is_active: false });
    return true;
  }
}

module.exports = new UserService();
