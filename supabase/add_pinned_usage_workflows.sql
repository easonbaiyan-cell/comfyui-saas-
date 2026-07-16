-- Add is_pinned and usage_count to workflows table
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
