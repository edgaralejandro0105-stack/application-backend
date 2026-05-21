const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Sale = require('./Sale.model');
const Product = require('./Product.model');

const SaleDetail = db.define('SaleDetail', {
  detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sale_id: {
    type: DataTypes.INTEGER,
    references: { model: Sale, key: 'sale_id' }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: { model: Product, key: 'product_id' },
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL,
    allowNull: false // Guardamos el precio del momento por si luego cambia en el catálogo
  }
}, {
  tableName: 'sale_details',
  timestamps: false
});

SaleDetail.belongsTo(Sale, { foreignKey: 'sale_id' });
SaleDetail.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = SaleDetail;