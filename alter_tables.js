const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Arrays of tables
    const tables = ['clients', 'events', 'employees', 'providers'];
    for (const table of tables) {
      console.log('Altering table: ' + table);
      try {
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN deleted_at TIMESTAMP;`);
      } catch (e) { console.log('Column deleted_at probably exists or error: ' + e.message); }
      
      try {
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN is_active BOOLEAN DEFAULT true;`);
      } catch (e) { console.log('Column is_active probably exists or error: ' + e.message); }
    }
    
    // For products table, checking what it has:
    try {
      await sequelize.query(`ALTER TABLE "products" ADD COLUMN is_active BOOLEAN DEFAULT true;`);
    } catch (e) { console.log('Column is_active probably exists in products: ' + e.message); }
    
    try {
      await sequelize.query(`ALTER TABLE "products" ADD COLUMN deleted_at TIMESTAMP;`);
    } catch (e) { console.log('Column deleted_at probably exists in products: ' + e.message); }

    console.log('Done!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}
run();
