-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle new user registration safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_id_text TEXT;
  v_inviter_id UUID;
BEGIN
  v_inviter_id_text := NEW.raw_user_meta_data->>'inviter_id';

  -- Check if it is a valid UUID format before casting to prevent signup crashes
  IF v_inviter_id_text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    v_inviter_id := v_inviter_id_text::UUID;
  ELSE
    v_inviter_id := NULL;
  END IF;

  INSERT INTO public.profiles (id, points, inviter_id)
  VALUES (
    NEW.id,
    500, -- Default 500 points
    v_inviter_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
