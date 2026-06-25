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
  category: {
    type: DataTypes.STRING(100)
  },
  rif: {
    type: DataTypes.STRING(20)
  },
  contact_name: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isValidEmail(value) {
        if (value && value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Debe ser un correo válido');
        }
      }
    }
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
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

module.exports = Provider;
