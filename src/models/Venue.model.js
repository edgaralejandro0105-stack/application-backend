const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Venue = db.define('Venue', {
  venue_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
    // Nota: El diagrama indicaba int(200), en Postgres es INTEGER 
    // y la validación de límite se hace en el controlador.
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance', 'Reserved'),
    defaultValue: 'Available'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'venues',
  timestamps: false
});

module.exports = Venue;