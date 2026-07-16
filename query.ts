import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgres://postgres:hAp5%2ALC%21%2A%23%2AmdvV@db.wbjbbuespxtsdkuxohzk.supabase.co:5432/postgres",
  });
  await client.connect();
  try {
    const w = await client.query('SELECT * FROM workflows;');
    console.log("workflows count:", w.rows.length);
    const c = await client.query('SELECT * FROM categories;');
    console.log("categories count:", c.rows.length);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
