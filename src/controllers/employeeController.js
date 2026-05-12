const employeeService = require('../services/employee.service');
const catchAsync = require('../utils/catchAsync');

exports.createEmployee = catchAsync(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({ message: 'Empleado creado correctamente', data: employee });
});

exports.getAllEmployees = catchAsync(async (req, res) => {
  const result = await employeeService.getAllEmployees(req.query);
  res.status(200).json(result);
});

exports.getEmployeeById = catchAsync(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json(employee);
});

exports.updateEmployee = catchAsync(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({ message: 'Empleado actualizado', data: employee });
});

exports.deleteEmployee = catchAsync(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(200).json({ message: 'Empleado eliminado' });
});
