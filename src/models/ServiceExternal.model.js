const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Event = require('./Event.model');

const ServiceExternal = db.define('ServiceExternal', {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    references: { model: Event, key: 'event_id' }
  },
  provider_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  service_type: {
    type: DataTypes.STRING(30)
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'services_external',
  timestamps: false
});

ServiceExternal.belongsTo(Event, { foreignKey: 'event_id' });

module.exports = ServiceExternal;