const roleService = require('../services/role.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getAllRoles();
  res.status(200).json({
    status: 'success',
    data: roles
  });
});
