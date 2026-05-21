const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ServiceExternal = db.define('ServiceExternal', {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_type: {
    type: DataTypes.STRING(50)
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  base_price: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  provider_info: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'services_external',
  timestamps: false
});

module.exports = ServiceExternal;