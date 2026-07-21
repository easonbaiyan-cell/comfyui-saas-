'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const adminUuid = process.env.NEXT_PUBLIC_ADMIN_UUID || '';

function getAdminSupabase(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// Used strictly for operations where we must bypass RLS on behalf of an admin
function getServiceRoleSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getUsersAction(token: string) {
  try {
    const supabase = getAdminSupabase(token);

    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    // Since we fallback to UUID instead of email for user display, we only query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, created_at, is_distributor')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('getUsersAction Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch users' };
  }
}

export async function toggleDistributorAction(token: string, userId: string, isDistributor: boolean) {
  try {
    const authClient = getAdminSupabase(token);

    // Check if user is admin
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user || user.id !== adminUuid) {
      return { success: false, error: 'Unauthorized' };
    }

    const serviceClient = getServiceRoleSupabase();

    const { error } = await serviceClient
      .from('profiles')
      .update({ is_distributor: isDistributor })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('toggleDistributorAction Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update distributor status' };
  }
}
