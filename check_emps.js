const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkEmps() {
  const client = new Client({ connectionString });
  await client.connect();
  
  const empRes = await client.query('SELECT employee_id, user_id FROM employees');
  console.log('Employees:', empRes.rows);

  await client.end();
}

checkEmps().catch(console.error);

