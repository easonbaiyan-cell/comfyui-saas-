const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

// 1. Add import
if (!code.includes('SettingsInitializer')) {
  code = code.replace("import { createClient } from '@supabase/supabase-js';",
    "import { createClient } from '@supabase/supabase-js';\nimport { SettingsInitializer } from '@/components/SettingsInitializer';");
}

// 2. Fetch global_settings
let searchBlock = `
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        siteSettings = settingsData;
`;
let replaceBlock = `
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        siteSettings = settingsData;

        const { data: globalData } = await supabase
          .from('global_settings')
          .select('*')
          .eq('id', 1)
          .single();

        globalSettings = globalData;
`;
if (!code.includes('globalSettings = globalData;')) {
    code = code.replace("let siteSettings = null;", "let siteSettings = null;\n  let globalSettings = null;");
    code = code.replace(searchBlock, replaceBlock);
}

// 3. Render SettingsInitializer inside body
code = code.replace("<body", "<body");
if (!code.includes('<SettingsInitializer')) {
    code = code.replace("<PromoBanner text={bannerText} countdownUntil={bannerCountdown as Date} />",
      "<SettingsInitializer settings={globalSettings} />\n        <PromoBanner text={bannerText} countdownUntil={bannerCountdown as Date} />");
}

fs.writeFileSync('src/app/layout.tsx', code);
