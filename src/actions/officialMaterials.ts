'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a supabase client with the service role key to bypass RLS for admin tasks
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getOfficialMaterials(category: string) {
  const { data, error } = await supabase
    .from('official_materials')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data;
}

export async function getAllOfficialMaterials() {
  const { data, error } = await supabase
    .from('official_materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all materials:', error);
    return [];
  }
  return data;
}

export async function uploadOfficialMaterial(data: { category: string, type: 'image' | 'video', url: string }) {
  const { data: insertedData, error } = await supabase
    .from('official_materials')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error uploading material:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: insertedData };
}

export async function deleteOfficialMaterial(id: string) {
  const { error } = await supabase
    .from('official_materials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting material:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
