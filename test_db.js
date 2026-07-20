const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
