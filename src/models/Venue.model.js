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
  status: {
    type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance'),
    defaultValue: 'Available'
  }
}, {
  tableName: 'venues',
  timestamps: false // Si no necesitas trackear creación/edición de infraestructura
});

module.exports = Venue;