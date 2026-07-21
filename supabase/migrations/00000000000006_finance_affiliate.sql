-- 1. Create affiliate_rules table
CREATE TABLE IF NOT EXISTS public.affiliate_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  min_invites INT NOT NULL,
  max_invites INT,
  commission_rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.affiliate_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on affiliate_rules"
  ON public.affiliate_rules FOR SELECT
  USING (true);

-- Removed the overly permissive "authenticated" policy.
-- Mutations will be handled server-side using the service role or admin token, bypassing RLS.

CREATE TRIGGER update_affiliate_rules_updated_at
BEFORE UPDATE ON public.affiliate_rules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create invite_relationships table
CREATE TABLE IF NOT EXISTS public.invite_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invite_relationships ENABLE ROW LEVEL SECURITY;

-- Removed the overly permissive "authenticated" policy.

-- 3. Alter commissions table
ALTER TABLE public.commissions
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'settled', 'revoked')) DEFAULT 'pending';
