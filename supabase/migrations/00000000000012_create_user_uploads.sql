CREATE TABLE IF NOT EXISTS public.user_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own uploads"
  ON public.user_uploads FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view their own uploads"
  ON public.user_uploads FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own uploads"
  ON public.user_uploads FOR DELETE
  USING ( auth.uid() = user_id );
