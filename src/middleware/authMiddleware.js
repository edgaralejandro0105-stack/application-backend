const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { User, Role } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token no proporcionado. Por favor inicie sesión.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    if (!decoded || !decoded.id) {
      return next(new AppError('Token inválido.', 401));
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role }]
    });

    if (!user) {
      return next(new AppError('El usuario que pertenece a este token ya no existe.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido. Inicie sesión nuevamente.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Su token ha expirado. Inicie sesión nuevamente.', 401));
    }
    next(error);
  }
};

const requireRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.Role?.role_name;
    const accessLevel = req.user?.Role?.access || 0;
    
    // Si no se especifican roles, asume que solo el Admin (access >= 3) puede entrar
    if (roles.length === 0) {
      if (accessLevel < 3) {
        return next(new AppError('No tiene permisos para realizar esta acción.', 403));
      }
      return next();
    }

    // Administrador (access >= 3) tiene acceso a todo
    if (accessLevel >= 3) {
      return next();
    }

    if (!userRole || !roles.includes(userRole)) {
      return next(new AppError('No tiene permisos para realizar esta acción.', 403));
    }

    next();
  };
};

const { Client } = require('../models');

const verifyClientToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token no proporcionado. Por favor inicie sesión.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_casona');

    if (!decoded || !decoded.client_id) {
      return next(new AppError('Token de cliente inválido.', 401));
    }

    const client = await Client.findByPk(decoded.client_id);

    if (!client) {
      return next(new AppError('El cliente asociado a este token ya no existe.', 401));
    }

    req.user = { client_id: client.client_id, email: client.email, role: 'Client' };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido. Inicie sesión nuevamente.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Su token ha expirado. Inicie sesión nuevamente.', 401));
    }
    next(error);
  }
};

module.exports = {
  verifyToken,
  requireRoles,
  verifyClientToken
};
