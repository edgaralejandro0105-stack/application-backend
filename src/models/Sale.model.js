const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User.model');

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
  timestamps: false
});

Sale.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Sale;