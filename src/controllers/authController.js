const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  
  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      status: user.status
    },
    token
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  
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
});

exports.refreshToken = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token || req.body.refreshToken;
  const newToken = await authService.refreshToken(token);
  
  res.status(200).json({ message: 'Token renovado', token: newToken });
});

exports.getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.user_id);
  res.status(200).json(user);
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json({ message: "Si el correo está registrado, se enviará un enlace de recuperación." });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.status(200).json({ message: "Contraseña actualizada exitosamente." });
});

