const { Op } = require('sequelize');
const { Employee, EventStaff, Event, Venue } = require('../models');
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
    if (query.rol) {
      where.rol = query.rol;
    }
    if (query.status) {
      where.status = query.status;
    }

    const options = { 
      where, 
      limit, 
      offset, 
      order: [['created_at', 'DESC']],
      include: [
        {
          model: EventStaff,
          include: [
            {
              model: Event,
              include: [{ model: Venue, attributes: ['name'], through: { attributes: [] } }]
            }
          ]
        }
      ]
    };
    if (query.includeDeleted === 'true') options.paranoid = false;

    const result = await Employee.findAndCountAll(options);

    const mappedData = result.rows.map(emp => {
      const e = emp.toJSON();
      if (e.EventStaffs) {
        e.assignments = e.EventStaffs.map(staff => ({
          event: staff.Event ? staff.Event.type_event || staff.Event.name || staff.Event.title : 'Evento',
          date: staff.Event ? staff.Event.start_date : null,
          venue: (staff.Event && staff.Event.Venues && staff.Event.Venues.length > 0) ? staff.Event.Venues.map(v => v.name).join(', ') : 'Salón'
        })).filter(a => a.date); // solo mantener los que tengan fecha
        delete e.EventStaffs;
      } else {
        e.assignments = [];
      }
      return e;
    });

    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: mappedData };
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
