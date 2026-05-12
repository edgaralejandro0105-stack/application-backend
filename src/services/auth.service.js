const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role } = require('../models');
const AppError = require('../utils/AppError');

class AuthService {
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.user_id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  }

  async register(data) {
    const { name, email, password, role_id } = data;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('El correo ya está registrado', 400);
    }

    const newUser = await User.create({
      name,
      email,
      password: this.hashPassword(password),
      role_id: role_id || 1,
      status: 'active'
    });

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    
    if (!user || user.password !== this.hashPassword(password)) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('Token no proporcionado', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 401);
      }

      const newToken = this.generateToken(user);
      return newToken;
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return user;
  }

  async recoverPassword(email, newPassword) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    user.password = this.hashPassword(newPassword);
    await user.save();
    return true;
  }
}

module.exports = new AuthService();
