const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Provider = db.define('Provider', {
  provider_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contact_name: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true }
  },
  address: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'providers',
  timestamps: false
});

module.exports = Provider;
