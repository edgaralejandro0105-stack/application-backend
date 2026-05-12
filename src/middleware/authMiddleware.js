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
    // Si la función se llama sin roles específicos, requiere acceso de admin como fallback.
    const userRole = req.user?.Role?.name || '';
    
    if (!roles.includes(userRole) && req.user?.Role?.access < 3) {
      return next(new AppError('No tiene permisos para realizar esta acción.', 403));
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRoles
};
