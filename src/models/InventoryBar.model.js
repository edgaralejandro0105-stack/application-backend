const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Product = require('./Product.model');
const User = require('./User.model');

const InventoryBar = db.define('InventoryBar', {
  inventory_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'product_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  movement_type: {
    type: DataTypes.ENUM('Purchase', 'Sale', 'Adjustment'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2), // Usamos decimal para manejar medios kilos o litros
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Puede ser nulo en caso de ajustes de inventario
  },
  notes: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_bar',
  timestamps: false // La columna 'date' ya nos da la temporalidad
});

// Relaciones técnicas
InventoryBar.belongsTo(Product, { foreignKey: 'product_id' });
InventoryBar.belongsTo(User, { foreignKey: 'user_id' });

module.exports = InventoryBar;