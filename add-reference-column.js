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

    // Agregar los valores al ENUM si no existen (PostgreSQL permite ADD VALUE)
    const newValues = ['reservation', 'payment'];

    for (const val of newValues) {
      try {
        await sequelize.query(
          `ALTER TYPE enum_notifications_type ADD VALUE IF NOT EXISTS '${val}';`
        );
        console.log(`✅ Valor '${val}' agregado al ENUM enum_notifications_type.`);
      } catch (err) {
        // IF NOT EXISTS puede no estar disponible en versiones viejas de PG
        if (err.message.includes('already exists')) {
          console.log(`ℹ️  Valor '${val}' ya existía.`);
        } else {
          throw err;
        }
      }
    }

    // Verificar valores actuales del ENUM
    const [rows] = await sequelize.query(`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
      WHERE pg_type.typname = 'enum_notifications_type'
      ORDER BY enumsortorder;
    `);
    console.log('\n📋 Valores actuales del ENUM enum_notifications_type:');
    rows.forEach(r => console.log(`   - ${r.enumlabel}`));

    console.log('\n✅ Migración del ENUM completada.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();
