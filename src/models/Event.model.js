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
  start_date: {
    type: DataTypes.DATE, 
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type_event: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Confirmed', 'Pending', 'On Hold', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'events',
  timestamps: false // Tu SQL no define columnas de tiempo para esta tabla
});

// Relaciones
Event.belongsTo(Client, { foreignKey: 'client_id' });
Event.belongsTo(Venue, { foreignKey: 'venue_id' });

module.exports = Event;