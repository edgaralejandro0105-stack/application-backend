const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkFKs() {
  const client = new Client({ connectionString });
  await client.connect();
  
  const empRes = await client.query('SELECT employee_id FROM employees LIMIT 5');
  console.log('Employees:', empRes.rows);

  const eventRes = await client.query('SELECT event_id FROM events LIMIT 5');
  console.log('Events:', eventRes.rows);

  await client.end();
}

checkFKs().catch(console.error);
