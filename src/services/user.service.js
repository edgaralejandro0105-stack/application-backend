const { User, Role } = require('../models');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers() {
    return await User.findAll({
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

    // Nunca actualizar la contraseña por esta vía
    const { password, ...updateData } = data;
    await user.update(updateData);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    await user.destroy();
    return true;
  }
}

module.exports = new UserService();
