import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: "postgres://postgres:hAp5%2ALC%21%2A%23%2AmdvV@db.wbjbbuespxtsdkuxohzk.supabase.co:5432/postgres",
  });
  await client.connect();
  try {
    const res = await client.query('SELECT reference_video_url, cover_image_url, cover_url FROM workflows LIMIT 3');
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
