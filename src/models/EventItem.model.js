const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Event = require('./Event.model');
const Product = require('./Product.model');

const EventItem = db.define('EventItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    references: { model: Event, key: 'event_id' }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: { model: Product, key: 'product_id' }
  },
  quantity_planned: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'event_items',
  timestamps: false
});

EventItem.belongsTo(Event, { foreignKey: 'event_id' });
EventItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = EventItem;