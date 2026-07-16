ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS rh_payload_template JSONB DEFAULT '{}'::jsonb;
