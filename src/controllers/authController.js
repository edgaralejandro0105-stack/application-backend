const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Role = require('../models/Role.model');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role_id: user.role_id
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email y password son requeridos' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const newUser = await User.create({
      name,
      email,
      password: hashPassword(password),
      role_id: role_id || 1,
      status: 'active'
    });

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Usuario registrado',
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id,
        status: newUser.status
      },
      token
    });
  } catch (error) {
    console.error('authController.register error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email y password son requeridos' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('authController.login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const newToken = generateToken(user);
    res.status(200).json({ message: 'Token renovado', token: newToken });
  } catch (error) {
    console.error('authController.refreshToken error:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
