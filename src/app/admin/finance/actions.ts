'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const adminUuid = process.env.NEXT_PUBLIC_ADMIN_UUID || '';

function getAdminSupabase(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function getFinanceDashboardDataAction(token: string) {
  try {
    const supabase = getAdminSupabase(token);

    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch aggregate metrics
    // Since we can't easily do aggregate queries on standard postgrest without RPC,
    // for small dataset we could fetch or we use RPC.
    // Here we'll fetch them as arrays and aggregate in memory for the admin dashboard.
    // In production, we'd use a postgres view or RPC.

    const { data: orders, error: ordersError } = await supabase
      .from('recharge_orders')
      .select('amount')
      .eq('status', 'paid');

    if (ordersError) throw ordersError;

    const { data: commissions, error: commissionsError } = await supabase
      .from('commissions')
      .select('commission_amount');

    if (commissionsError) throw commissionsError;

    // Fetch recent commission list with joined order info
    const { data: commissionsList, error: listError } = await supabase
      .from('commissions')
      .select(`
        id,
        inviter_id,
        invitee_id,
        order_amount,
        commission_amount,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (listError) throw listError;

    const totalRechargeAmount = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    const totalCommissionAmount = commissions.reduce((sum, comm) => sum + Number(comm.commission_amount), 0);
    const totalOrderCount = orders.length;

    return {
      success: true,
      metrics: {
        totalRechargeAmount,
        totalCommissionAmount,
        totalOrderCount,
      },
      commissionsList: commissionsList || [],
    };
  } catch (error: any) {
    console.error('getFinanceDashboardDataAction Error:', error);
    return { success: false, error: error.message };
  }
}
