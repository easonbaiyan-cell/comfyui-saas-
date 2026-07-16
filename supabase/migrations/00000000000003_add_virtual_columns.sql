ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS virtual_platform TEXT;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS virtual_likes INTEGER DEFAULT 0;
