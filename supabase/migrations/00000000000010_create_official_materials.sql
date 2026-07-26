CREATE TABLE IF NOT EXISTS public.official_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.official_materials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on official_materials"
    ON public.official_materials
    FOR SELECT
    USING (true);

-- Allow service role to manage
CREATE POLICY "Allow service role all on official_materials"
    ON public.official_materials
    USING (true)
    WITH CHECK (true);

-- Note: In Supabase, service role bypasses RLS anyway, but good to be explicit or if needed.

-- Create storage bucket for official materials if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('official_materials', 'official_materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'official_materials' );

CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'official_materials' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'official_materials' );
