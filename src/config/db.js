const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables del .env

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Le decimos específicamente que hablamos con PostgreSQL
    logging: false,      // Ponlo en 'true' si quieres ver el SQL que Sequelize genera en la consola
    pool: {
      max: 5,            // Máximo de conexiones simultáneas
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

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