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

    try {
      const emailService = require('./email.service');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      await emailService.sendEmail({
        to: email,
        subject: 'Tus credenciales de acceso - La Casona',
        templateName: 'welcome-credentials',
        context: {
          name,
          email,
          password, // send the raw password
          loginUrl: `${frontendUrl}/login`
        }
      });
    } catch (err) {
      console.error('Error al enviar correo de credenciales:', err);
      // No lanzamos error para no interrumpir el flujo de creación de usuario
    }

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['role_name', 'access'] }]
    });

    // Credenciales inválidas — mismo mensaje para email y contraseña (seguridad)
    if (!user || user.password !== this.hashPassword(password)) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar que la cuenta esté activa
    if (user.status === 'inactive') {
      throw new AppError('Tu cuenta ha sido desactivada. Contacta al administrador.', 403);
    }
    if (user.status === 'suspended') {
      throw new AppError('Tu cuenta está suspendida. Contacta al administrador.', 403);
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

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, retornamos true de todas formas sin avisar si existe o no
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = resetToken;
    user.reset_password_expires = new Date(Date.now() + 15 * 60000); // 15 minutos
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailService = require('./email.service');
    await emailService.sendEmail({
      to: user.email,
      subject: 'Recuperación de Contraseña - La Casona',
      templateName: 'recover-password',
      context: {
        name: user.name,
        resetUrl: resetUrl
      }
    });

    return true;
  }

  async resetPassword(token, newPassword) {
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: { 
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: new Date() }
      } 
    });

    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    user.password = this.hashPassword(newPassword);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
