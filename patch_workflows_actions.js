const fs = require('fs');
const path = 'src/app/admin/workflows/actions.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { revalidatePath }')) {
    content = content.replace(
        "import { createClient } from '@supabase/supabase-js';",
        "import { createClient } from '@supabase/supabase-js';\nimport { revalidatePath } from 'next/cache';"
    );
}

// 1. Modify getWorkflowsAction
content = content.replace(
    ".order('created_at', { ascending: false });",
    ".order('sort_order', { ascending: true, nullsFirst: false })\n      .order('created_at', { ascending: false });"
);

// 2. Add deleteWorkflowAction and reorderWorkflowsAction
const actionsToAdd = `
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
`;

if (!content.includes('deleteWorkflowAction')) {
    content += actionsToAdd;
}

fs.writeFileSync(path, content);
console.log('Patched actions.ts');
