const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Role = db.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255)
  },
  access: {
    type: DataTypes.INTEGER, // Aquí puedes manejar niveles (ej: 1 lectura, 2 escritura, 3 admin)
    defaultValue: 1
  }
}, {
  tableName: 'rol',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

module.exports = Role;