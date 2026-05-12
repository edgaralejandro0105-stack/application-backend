const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Catalog = db.define('Catalog', {
  catalog_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'catalogs',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

module.exports = Catalog;
