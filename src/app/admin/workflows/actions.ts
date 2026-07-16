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
        video_url: formData.video_url,
        cost_points: parseInt(formData.cost_points) || 0,
        r_app_id: formData.r_app_id,
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

export async function togglePinWorkflowAction(workflowId: string, currentPinStatus: boolean, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('workflows')
      .update({ is_pinned: !currentPinStatus })
      .eq('id', workflowId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in togglePinWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleStatusWorkflowAction(workflowId: string, currentStatus: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const newStatus = currentStatus === 'published' ? 'offline' : 'published';

    const { error } = await supabase
      .from('workflows')
      .update({ status: newStatus })
      .eq('id', workflowId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in toggleStatusWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function createCategoryAction(name: string, requiredTier: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase.from('categories').insert([
      {
        name,
        required_tier: requiredTier
      }
    ]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in createCategoryAction:', error);
    return { success: false, error: error.message };
  }
}

export async function getCategoriesAction(accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, categories: data };
  } catch (error: any) {
    console.error('Error in getCategoriesAction:', error);
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
