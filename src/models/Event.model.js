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
    allowNull: true,
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dj: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type_event: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Confirmed', 'Pending', 'On Hold', 'Cancelled', 'Lead', 'Finished'),
    defaultValue: 'Pending'
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
  tableName: 'events',
  timestamps: false
});

// Relaciones
Event.belongsTo(Client, { foreignKey: 'client_id' });

module.exports = Event;