const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User.model');

const Sale = db.define('Sale', {
  sale_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'user_id' }
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  sale_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sales',
  timestamps: false
});

Sale.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Sale;