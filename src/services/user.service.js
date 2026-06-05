const { User, Role } = require('../models');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers() {
    return await User.findAll({
      where: { is_active: true },
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
    
    // Si se envía una contraseña, encriptarla
    if (updateData.password) {
      const crypto = require('crypto');
      updateData.password = crypto.createHash('sha256').update(updateData.password).digest('hex');
    }

    await user.update(updateData);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    await user.update({ is_active: false });
    return true;
  }
}

module.exports = new UserService();
