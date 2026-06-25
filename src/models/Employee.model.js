const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User.model');
const Role = require('./Role.model');

const Employee = db.define('Employee', {
  employee_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // No todos los empleados necesitan acceso al sistema
    references: {
      model: User,
      key: 'user_id'
    }
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15)
  },
  email: {
    type: DataTypes.STRING(80),
    unique: true,
    validate: {
      isValidEmail(value) {
        if (value && value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Debe ser un correo válido');
        }
      }
    }
  },

  rol: {
    type: DataTypes.STRING
  },
  salary_per_event: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relaciones técnicas
Employee.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Employee;