const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(user);
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({ message: 'Usuario actualizado correctamente', data: user });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json({ message: 'Usuario eliminado de la base de datos' });
});