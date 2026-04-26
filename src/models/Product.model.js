const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Product = db.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(10), // Ej: Bebida, Comida, Insumo
    allowNull: false
  },
  measurement_unit: {
    type: DataTypes.STRING(10), // Ej: Unidad, Litro, Kg
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

module.exports = Product;