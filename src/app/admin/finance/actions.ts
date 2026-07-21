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
        order_id,
        order_amount,
        commission_amount,
        commission_rate,
        status,
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

export async function getAffiliateRulesAction(token: string) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('affiliate_rules')
      .select('*')
      .order('min_invites', { ascending: true });

    if (error) throw error;
    return { success: true, rules: data };
  } catch (error: any) {
    console.error('getAffiliateRulesAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function saveAffiliateRuleAction(token: string, rule: any) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    if (rule.id) {
      const { error } = await supabase
        .from('affiliate_rules')
        .update({
          min_invites: rule.min_invites,
          max_invites: rule.max_invites,
          commission_rate: rule.commission_rate,
        })
        .eq('id', rule.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('affiliate_rules')
        .insert([{
          min_invites: rule.min_invites,
          max_invites: rule.max_invites,
          commission_rate: rule.commission_rate,
        }]);
      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('saveAffiliateRuleAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAffiliateRuleAction(token: string, id: string) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('affiliate_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteAffiliateRuleAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function bindRelationshipAction(token: string, inviter_id: string, invitee_id: string) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('invite_relationships')
      .upsert({ inviter_id, invitee_id }, { onConflict: 'invitee_id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('bindRelationshipAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function unbindRelationshipAction(token: string, invitee_id: string) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('invite_relationships')
      .delete()
      .eq('invitee_id', invitee_id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('unbindRelationshipAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCommissionAmountAction(token: string, id: string, newAmount: number) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('commissions')
      .update({ commission_amount: newAmount })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('updateCommissionAmountAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function revokeCommissionAction(token: string, id: string) {
  try {
    const supabase = getAdminSupabase(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('commissions')
      .update({ status: 'revoked' })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('revokeCommissionAction Error:', error);
    return { success: false, error: error.message };
  }
}
