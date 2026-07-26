import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getOfficialMaterials(category?: string) {
  let query = supabase.from('official_materials').select('*').order('created_at', { ascending: false });
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching materials', error);
    return [];
  }
  return data;
}

export async function uploadOfficialMaterial(formData: FormData) {
  // We'll upload directly in client for storage, then just save the URL in DB via action
  // Wait, the prompt says uploadOfficialMaterial(data)
  // Let's implement an action that saves the DB record
}

export async function deleteOfficialMaterial(id: string) {
  const { error } = await supabase.from('official_materials').delete().eq('id', id);
  if (error) {
    console.error('Error deleting material', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
