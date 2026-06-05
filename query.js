const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', { logging: false });

async function checkVenues() {
  const [venues] = await db.query(`SELECT venue_id, name FROM venues`);
  console.log("Venues:", venues);
  process.exit();
}
checkVenues();
