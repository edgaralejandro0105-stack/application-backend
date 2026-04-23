const { Pool } = require('pg');
require('dotenv').config();

// El Pool de conexiones es más eficiente para múltiples peticiones
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Verificación de conexión
pool.on('connect', () => {
  console.log('✅ Conexión exitosa a la base de datos Postgres');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};