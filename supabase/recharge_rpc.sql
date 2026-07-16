-- Ensure the recharge_orders and commissions tables exist first if they haven't been created yet
CREATE TABLE IF NOT EXISTS public.recharge_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('base', 'annual', 'month', 'year')),
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.recharge_orders(id) ON DELETE CASCADE,
  order_amount NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC for atomic recharge transaction
CREATE OR REPLACE FUNCTION public.process_recharge_tx(
    p_user_id UUID,
    p_plan_type TEXT,
    p_amount NUMERIC,
    p_points_to_add INTEGER
) RETURNS JSON AS $$
DECLARE
    v_new_points INTEGER;
    v_order_id UUID;
    v_inviter_id UUID;
    v_commission_amount NUMERIC;
BEGIN
    -- 1. Atomically add points and get inviter_id
    UPDATE public.profiles
    SET points = points + p_points_to_add
    WHERE id = p_user_id
    RETURNING points, inviter_id INTO v_new_points, v_inviter_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for user_id: %', p_user_id;
    END IF;

    -- 2. Create paid order
    INSERT INTO public.recharge_orders (user_id, plan_type, amount, status)
    VALUES (p_user_id, p_plan_type, p_amount, 'paid')
    RETURNING id INTO v_order_id;

    -- 3. Handle commissions
    IF v_inviter_id IS NOT NULL THEN
        v_commission_amount := p_amount * 0.20;

        INSERT INTO public.commissions (inviter_id, invitee_id, order_id, order_amount, commission_amount)
        VALUES (v_inviter_id, p_user_id, v_order_id, p_amount, v_commission_amount);
    END IF;

    RETURN json_build_object(
        'success', true,
        'newPoints', v_new_points,
        'orderId', v_order_id
    );
EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic on exception in PL/pgSQL
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE THE RPC: Prevent arbitrary execution from the client.
-- This function must only be called from a trusted backend environment using the service_role key.
REVOKE EXECUTE ON FUNCTION public.process_recharge_tx(UUID, TEXT, NUMERIC, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_recharge_tx(UUID, TEXT, NUMERIC, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_recharge_tx(UUID, TEXT, NUMERIC, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_recharge_tx(UUID, TEXT, NUMERIC, INTEGER) TO service_role;
