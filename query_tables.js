const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1);
  console.log("site_settings:", data, error);
  const { data: data2, error: error2 } = await supabase.from('global_settings').select('*').limit(1);
  console.log("global_settings:", data2, error2);
}
check();
