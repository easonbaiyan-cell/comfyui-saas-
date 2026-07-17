import { Client } from 'pg';
import fs from 'fs';

async function runSchema() {
  // Using DIRECT_URL for migrations
  const connectionString = "postgres://postgres:hAp5%2ALC%21%2A%23%2AmdvV@db.wbjbbuespxtsdkuxohzk.supabase.co:5432/postgres";
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
    await client.query(schema);
    console.log("Schema applied successfully.");

  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

runSchema();
