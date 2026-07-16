const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const { user, token, refreshToken } = await authService.register(req.body);
  
  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      status: user.status
    },
    token,
    refreshToken
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token, refreshToken } = await authService.login(email, password);
  
  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      status: user.status,
      Role: user.Role
    },
    token,
    refreshToken
  });
});

exports.logout = catchAsync(async (req, res) => {
  // Opcionalmente se puede invalidar el refresh token en la DB si se guarda,
  // por ahora solo respondemos con éxito para que el frontend limpie los suyos.
  res.status(200).json({ message: 'Cierre de sesión exitoso' });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const token = req.body.refreshToken || req.headers.authorization?.split(' ')[1] || req.body.token;
  const { token: newToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);
  
  res.status(200).json({ message: 'Token renovado', token: newToken, refreshToken: newRefreshToken });
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

