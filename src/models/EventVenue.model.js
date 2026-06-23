const { DataTypes } = require('sequelize');
const db = require('../config/db');

const EventVenue = db.define('EventVenue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'event_venues',
  timestamps: false
});

module.exports = EventVenue;
