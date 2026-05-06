const { DataTypes } = require('sequelize');
const db = require('../config/db'); // Importamos la conexión a la base de datos

const Client = db.define('Client', {
  client_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Fundamental para que se asigne solo al crear uno nuevo
  },
  name: {
    type: DataTypes.STRING(50), // Respetando el límite de tu diagrama
    allowNull: false, // No podemos tener un cliente sin nombre
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  doc_id: {
    type: DataTypes.STRING,
    unique: true, // Sequelize validará que no haya dos clientes con la misma cédula/documento
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(11),
  },
  direction: {
    type: DataTypes.STRING(80),
  }
}, {
  // Configuraciones adicionales del modelo
  tableName: 'clients', // Forzamos el nombre exacto de tu tabla en minúsculas
  timestamps: true,     // Activa la creación automática de fechas
  createdAt: 'created_at', // Mapeamos al nombre exacto que pusiste en tu diagrama
  updatedAt: 'update_at'
});

module.exports = Client;