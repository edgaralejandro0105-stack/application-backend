// Desestructuramos DataTypes de sequelize para definir si es STRING, INTEGER, etc.
const { DataTypes } = require('sequelize');
const db = require('../config/db'); // Importamos la conexión a la base de datos

// Definimos el modelo 'Client' (la tabla clientes)
const Client = db.define('Client', {
  // Mapeo de la columna 'client_id' de tu base de datos
  client_id: {
    type: DataTypes.INTEGER, // Tipo de dato Entero
    primaryKey: true,        // Es la llave primaria (identificador único del registro)
    autoIncrement: true, // Fundamental para que se asigne solo al crear uno nuevo
  },
  name: {
    type: DataTypes.STRING(50), // Respetando el límite de tu diagrama
    allowNull: false, // Regla vital: la BD rechazará el registro si este campo viene vacío (nulo)
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  doc_id: {
    type: DataTypes.STRING,
    unique: true, // REGLA: No pueden existir dos clientes con el mismo número de documento
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(50), // Ampliado a 50 caracteres para soportar formatos internacionales
  },
  email: {
    type: DataTypes.STRING(255)
  },
  direction: {
    type: DataTypes.STRING(80)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
  }
}, {
  // Configuraciones adicionales del modelo
  tableName: 'clients', // Forzamos el nombre exacto de tu tabla en Postgres (sensible a mayúsculas)
  timestamps: true,     // Activa la creación automática de fechas
  // Traducimos los nombres que Sequelize crea por defecto (createdAt) a los que tú usaste en tu SQL
  createdAt: 'created_at', 
  updatedAt: false,
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Client;