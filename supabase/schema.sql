-- Supabase Schema for papagaga.com

-- 1. Site Settings (100% Database-driven UI)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  top_banner_text TEXT,
  top_banner_countdown TIMESTAMP WITH TIME ZONE,
  logo_url TEXT,
  -- JSONB array for nav links. Expected structure: 
  -- [{ "label": "Link Name", "type": "redirect", "url": "..." }, { "label": "Link Name", "type": "modal", "content": "..." }]
  nav_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workflows (Grid cards for ComfyUI RunningHub tasks)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  runninghub_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT,
  credit_cost NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: User and Authentication tables are handled by Supabase Auth natively (auth.users).
