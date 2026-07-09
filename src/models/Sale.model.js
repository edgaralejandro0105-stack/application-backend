const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Employee = require('./Employee.model');

const Sale = db.define('Sale', {
  sale_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER
  },
  employee_id: {
    type: DataTypes.INTEGER
  },
  total: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0.00
  },
  reference: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'overdue'),
    defaultValue: 'pending'
  },
  create_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'sales',
  timestamps: false,
  hooks: {
    beforeCreate: (sale) => {
      if (!sale.reference) {
        sale.reference = `INV-${String(Date.now()).slice(-6)}`;
      }
    }
  }
});

Sale.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Sale;