const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.status(200).json(users);
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(user);
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(user);
});

exports.updatePassword = catchAsync(async (req, res) => {
  await userService.updatePassword(req.params.id, req.body);
  res.status(200).json({ message: 'Contraseña actualizada correctamente' });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json({ message: 'Usuario enviado a la papelera' });
});

exports.restoreUser = catchAsync(async (req, res) => {
  await userService.restoreUser(req.params.id);
  res.status(200).json({ message: 'Usuario restaurado' });
});