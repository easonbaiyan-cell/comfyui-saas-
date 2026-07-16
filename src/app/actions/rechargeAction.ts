"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // fallback to anon for tests if service role not set

// Pre-defined mapping of plans to amounts and points.
// This ensures we do not trust client-provided numbers.
const PLAN_MAPPING: Record<string, { amount: number; points: number }> = {
  'base': { amount: 68, points: 6800 },
  'month': { amount: 128, points: 15000 },
  'year': { amount: 998, points: 150000 },
  'annual': { amount: 1998, points: 400000 },
};

export async function processRecharge({
  accessToken,
  userId,
  planType,
}: {
  accessToken: string;
  userId: string;
  planType: 'base' | 'annual' | 'month' | 'year';
}) {
  const planInfo = PLAN_MAPPING[planType];

  if (!planInfo) {
    return { success: false, error: 'Invalid plan type provided.' };
  }

  // First, verify the user's identity using their provided access token
  const userSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data: { user }, error: authError } = await userSupabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized: Invalid access token.' };
  }

  if (user.id !== userId) {
    return { success: false, error: 'Unauthorized: User ID mismatch.' };
  }

  // Once authenticated and authorized, use the SERVICE ROLE key to execute the securely defined RPC
  // This bypasses RLS and has execution rights on the secured `process_recharge_tx` function
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await adminSupabase.rpc('process_recharge_tx', {
      p_user_id: userId,
      p_plan_type: planType,
      p_amount: planInfo.amount,
      p_points_to_add: planInfo.points,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('processRecharge Error:', error.message);
    return { success: false, error: error.message };
  }
}
