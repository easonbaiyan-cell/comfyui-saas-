import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgres://postgres:hAp5%2ALC%21%2A%23%2AmdvV@db.wbjbbuespxtsdkuxohzk.supabase.co:5432/postgres",
  });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'workflows'
    `);
    console.log("workflows:", res.rows);

    const res2 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'categories'
    `);
    console.log("categories:", res2.rows);

    const res3 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_wallets'
    `);
    console.log("user_wallets:", res3.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
