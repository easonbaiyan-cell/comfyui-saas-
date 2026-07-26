'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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
        subtitle2: formData.subtitle2,
        description: formData.description,
        category: formData.category,
        cost_points: parseInt(formData.cost_points) || 0,
        r_app_id: formData.r_app_id,
        node_mapping: formData.node_mapping || [],
        rh_payload_template: formData.rh_payload_template || [],
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

export async function updateCategoryAction(categoryId: string, name: string, requiredTier: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name,
        required_tier: requiredTier
      })
      .eq("id", categoryId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCategoryAction:", error);
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
      .order('sort_order', { ascending: true })
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

export async function deleteCategoryAction(categoryId: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteCategoryAction:', error);
    return { success: false, error: error.message };
  }
}

export async function reorderCategoriesAction(updates: { id: string; sort_order: number }[], accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    // Supabase JS client doesn't have a simple bulk update for arbitrary fields,
    // so we'll do individual updates. Given categories are small in number, this is acceptable.
    for (const update of updates) {
      const { error } = await supabase
        .from('categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in reorderCategoriesAction:', error);
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

    let data, error;

    try {
      const result = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      data = result.data;
      error = result.error;

      if (error) {
        throw error;
      }
    } catch (primaryError) {
      console.error("Fetch Workflows Error (Primary Query):", primaryError);

      // Fallback query without sort_order
      const fallbackResult = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      data = fallbackResult.data;
      error = fallbackResult.error;

      if (error) {
        console.error("Fetch Workflows Error (Fallback Query):", error);
        throw error;
      }
    }

    return { success: true, workflows: data };
  } catch (error: any) {
    console.error('Error in getWorkflowsAction:', error);
    return { success: false, error: error.message };
  }
}

export async function getWorkflowAction(workflowId: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      throw error;
    }

    return { success: true, workflow: data };
  } catch (error: any) {
    console.error('Error in getWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function updateWorkflowAction(workflowId: string, formData: any, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('workflows')
      .update({
        title: formData.title,
        subtitle2: formData.subtitle2,
        description: formData.description,
        category: formData.category,
        cost_points: parseInt(formData.cost_points) || 0,
        r_app_id: formData.r_app_id,
        node_mapping: formData.node_mapping || [],
        rh_payload_template: formData.rh_payload_template || [],
      })
      .eq('id', workflowId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteWorkflowAction(workflowId: string, accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/workflows');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteWorkflowAction:', error);
    return { success: false, error: error.message };
  }
}

export async function reorderWorkflowsAction(updates: { id: string; sort_order: number }[], accessToken: string) {
  try {
    const supabase = getAuthenticatedClient(accessToken);
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user || userData.user.id !== process.env.NEXT_PUBLIC_ADMIN_UUID) {
      throw new Error('Unauthorized');
    }

    // Process individual updates
    for (const update of updates) {
      const { error } = await supabase
        .from('workflows')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    revalidatePath('/admin/workflows');
    return { success: true };
  } catch (error: any) {
    console.error('Error in reorderWorkflowsAction:', error);
    return { success: false, error: error.message };
  }
}
