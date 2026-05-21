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
  create_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

Sale.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Sale;