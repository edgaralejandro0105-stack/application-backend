require('dotenv').config();
const { Sequelize } = require('sequelize');

const isLocal =
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

const dialectOptions = isLocal
  ? {}
  : { ssl: { require: true, rejectUnauthorized: false } };

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.');

    // Verificar qué columnas existen actualmente en la tabla payments
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position;
    `);
    const existingCols = columns.map(c => c.column_name);
    console.log('📋 Columnas actuales en la tabla payments:', existingCols);

    // Agregar columna simulated
    await sequelize.query(`
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS simulated BOOLEAN DEFAULT true;
    `);
    console.log('✅ Columna "simulated" agregada a la tabla "payments" correctamente.');

    // Verificar resultado final
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position;
    `);
    console.log('\n📋 Columnas finales en la tabla payments:');
    finalColumns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

    console.log('\n✅ Migración completada exitosamente.');
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
  } finally {
    await sequelize.close();
  }
})();
