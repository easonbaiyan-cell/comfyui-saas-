const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const fs = require('fs');
  const sql = fs.readFileSync('supabase/migrations/00000000000005_create_global_settings.sql', 'utf8');

  // Extract DB URL from Supabase connection string if available
  const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Migration executed");
  } catch(e) {
    console.error("Migration error:", e);
  } finally {
    await client.end();
  }
}
run();
