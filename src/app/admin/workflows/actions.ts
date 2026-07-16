'use server';

import { createClient } from '@supabase/supabase-js';

// Re-initialize Supabase client with the admin's token
// to ensure Row Level Security policies evaluate correctly.
function getAuthenticatedClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

export async function createWorkflowAction(formData: any, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase.from('workflows').insert([
      {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        cover_url: formData.cover_url,
        cost_points: parseInt(formData.cost_points) || 0,
        r_app_id: formData.r_app_id,
        r_submit_url: formData.r_submit_url,
        r_query_url: formData.r_query_url,
        node_mapping: formData.node_mapping || [],
        status: 'published'
      }
    ]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in createWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function getWorkflowsAction(accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, workflows: data };
  } catch (error: any) {
    console.error('Error in getWorkflowsAction:', error);
    return { success: false, error: error.message };
  }
}
