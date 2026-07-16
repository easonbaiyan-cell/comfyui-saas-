-- Create the workflows table for Admin management
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_url TEXT,
  cost_points INTEGER DEFAULT 0,
  r_app_id TEXT,
  rh_payload_template JSONB DEFAULT '{}'::jsonb,
  r_submit_url TEXT,
  r_query_url TEXT,
  node_mapping JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published',
  is_pinned BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow admin to manage (Insert, Update, Delete, Select)
-- The admin's UUID needs to be matched against the authenticated user.
-- **IMPORTANT**: Replace 'YOUR_ADMIN_UUID_HERE' with your actual Admin UUID from Supabase.
CREATE POLICY "Admin can full access workflows"
  ON workflows
  FOR ALL
  USING (auth.uid() = 'YOUR_ADMIN_UUID_HERE'::uuid)
  WITH CHECK (auth.uid() = 'YOUR_ADMIN_UUID_HERE'::uuid);

-- Policy: Allow anyone (including anonymous) to read published workflows
CREATE POLICY "Anyone can read published workflows"
  ON workflows
  FOR SELECT
  USING (status = 'published');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
