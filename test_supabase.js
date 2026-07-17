import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Present" : "Missing");

if (!supabaseUrl) {
    console.error("No Supabase URL. Exiting.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: workflows, error: wError } = await supabase.from('workflows').select('*').limit(1);
  console.log("workflows error:", wError);
  console.log("workflows data:", workflows);

  const { data: categories, error: cError } = await supabase.from('categories').select('*').limit(1);
  console.log("categories error:", cError);
  console.log("categories data:", categories);
}
check();
