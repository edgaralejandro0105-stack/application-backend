const { Op } = require('sequelize');
const { Employee } = require('../models');
const AppError = require('../utils/AppError');

class EmployeeService {
  async createEmployee(data) {
    return await Employee.create(data);
  }

  async getAllEmployees(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { last_name: { [Op.iLike]: `%${query.search}%` } }
      ];
    }

    const options = { where, limit, offset, order: [['created_at', 'DESC']] };
    if (query.includeDeleted === 'true') options.paranoid = false;

    const result = await Employee.findAndCountAll(options);
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async getEmployeeById(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new AppError('Empleado no encontrado', 404);
    return employee;
  }

  async updateEmployee(id, data) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new AppError('Empleado no encontrado', 404);
    await employee.update(data);
    return employee;
  }

  async deleteEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new AppError('Empleado no encontrado', 404);
    await employee.destroy();
    return true;
  }
}

module.exports = new EmployeeService();
