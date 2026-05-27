const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Product = db.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  measurement_unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATEONLY
  },
  current_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  min_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Product;