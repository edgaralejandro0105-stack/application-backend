const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Event = require('./Event.model');
const ServiceExternal = require('./ServiceExternal.model');

const EventItem = db.define('EventItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    references: { model: Event, key: 'event_id' }
  },
  service_id: {
    type: DataTypes.INTEGER,
    references: { model: ServiceExternal, key: 'service_id' }
  },
  final_price: {
    type: DataTypes.DECIMAL,
    allowNull: true
  }
}, {
  tableName: 'event_items',
  timestamps: false
});

EventItem.belongsTo(Event, { foreignKey: 'event_id' });
EventItem.belongsTo(ServiceExternal, { foreignKey: 'service_id' });

module.exports = EventItem;