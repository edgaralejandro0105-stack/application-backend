// Importamos la clase Sequelize de la librería 'sequelize' (nuestro ORM)
const { Sequelize } = require('sequelize');
// Cargamos las variables de entorno desde el archivo .env a process.env
require('dotenv').config(); // Carga las variables del .env

// Detectamos si la conexión es a una base de datos local
// Esto es útil para saber si estamos desarrollando en nuestra PC o si ya está en producción
const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

// Configuramos el dialectOptions dinámicamente: sin SSL para local, con SSL para Neon
// Muchas bases de datos en la nube (como Neon o Heroku) exigen conexiones seguras (SSL)
const dialectOptions = isLocal ? {} : {
  ssl: {
    require: true,
    rejectUnauthorized: false // Permite conectarse a Neon aunque no tengamos un certificado propio
  }
};

// Instanciamos un nuevo objeto Sequelize pasando la URL de conexión de la BD
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', // Indicamos que el motor de base de datos es PostgreSQL
  logging: false,      // Apagamos los logs de SQL en consola para que no se ensucie la terminal
  pool: {
    // Configuramos el "Pool" (grupo) de conexiones para optimizar el rendimiento
    max: 5,           // Máximo 5 conexiones abiertas al mismo tiempo
    min: 0,           // Mínimo 0 conexiones (se cierran si no hay tráfico)
    acquire: 30000,   // Tiempo máximo (en milisegundos) que intentará conectarse antes de lanzar error
    idle: 10000       // Tiempo que una conexión debe estar inactiva para cerrarse
  },
  dialectOptions
});

// Función asíncrona para probar la conexión al arrancar el servidor
const testConnection = async () => {
  try {
    // .authenticate() solo intenta hacer un 'ping' a la BD sin hacer consultas pesadas
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

// Ejecutamos la función
testConnection();

// Exportamos la instancia para que los Modelos puedan usarla
module.exports = sequelize;