const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkEvents() {
  const client = new Client({ connectionString });
  await client.connect();
  const res = await client.query('SELECT event_id, name, status FROM events');
  console.log('Events from DB:', res.rows);
  await client.end();
}

checkEvents().catch(console.error);
