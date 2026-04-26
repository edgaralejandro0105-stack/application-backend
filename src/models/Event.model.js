const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Client = require('./Client.model');
const Venue = require('./Venue.model');

const Event = db.define('Event', {
  event_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    references: { model: Client, key: 'client_id' }
  },
  venue_id: {
    type: DataTypes.INTEGER,
    references: { model: Venue, key: 'venue_id' }
  },
  event_date: {
    type: DataTypes.DATEONLY, // Solo fecha, sin hora, para evitar líos de zona horaria
    allowNull: false
  },
  event_type: {
    type: DataTypes.STRING(30), // Boda, Corporativo, Cumpleaños...
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Lead', 'Confirmed', 'Finished', 'Cancelled'),
    defaultValue: 'Lead'
  },
  total_budget: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

// Relaciones
Event.belongsTo(Client, { foreignKey: 'client_id' });
Event.belongsTo(Venue, { foreignKey: 'venue_id' });

module.exports = Event;