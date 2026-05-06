const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Role = require('./Role.model'); // Importamos para la relación

const User = db.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING, // En el controlador la encriptaremos con BCrypt
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'create_at',
  updatedAt: 'update_at'
});

// Relación técnica: Un usuario PERTENECE a un Rol
User.belongsTo(Role, { foreignKey: 'role_id' });

module.exports = User;