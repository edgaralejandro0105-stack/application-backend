const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Role = require('../models/Role.model');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('authMiddleware.verifyToken error:', error);
    return res.status(401).json({ message: 'Error de autenticación', error: error.message });
  }
};

const requireAdmin = (req, res, next) => {
  const role = req.user?.Role || req.user?.role;
  const accessLevel = role?.access ?? 0;

  if (accessLevel < 3) {
    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin
};
