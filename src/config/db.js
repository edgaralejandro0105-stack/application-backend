const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables del .env

// Detectamos si la conexión es a una base de datos local
const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

// Configuramos el dialectOptions dinámicamente: sin SSL para local, con SSL para Neon
const dialectOptions = isLocal ? {} : {
  ssl: {
    require: true,
    rejectUnauthorized: false // Para Neon y otros servicios en la nube
  }
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions
});

// Función técnica para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

testConnection();

module.exports = sequelize;