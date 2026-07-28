'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getUserUploads(accessToken: string, type: 'image' | 'video') {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Unauthorized request to getUserUploads');
      return [];
    }
    const userId = user.id;

    const { data, error } = await supabase.schema('storage').from('objects')
      .select('name, metadata, updated_at')
      .eq('bucket_id', 'site-assets')
      .eq('owner', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user uploads:', error);
      return [];
    }

    const files = data.filter((file: any) => {
       const mimetype = file.metadata?.mimetype || '';
       if (type === 'image') return mimetype.startsWith('image/');
       if (type === 'video') return mimetype.startsWith('video/');
       return false;
    }).map((file: any) => {
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(file.name);
      return {
        name: file.name,
        url: publicUrl,
        updated_at: file.updated_at
      };
    });

    return files;
  } catch (error: any) {
    console.error('Failed to get user uploads:', error);
    return [];
  }
}

export async function deleteUserUpload(accessToken: string, fileName: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = user.id;

    const { data: fileData, error: verifyError } = await supabase.schema('storage').from('objects')
      .select('owner')
      .eq('bucket_id', 'site-assets')
      .eq('name', fileName)
      .single();

    if (verifyError || !fileData || fileData.owner !== userId) {
      return { success: false, error: 'Unauthorized or not found' };
    }

    const { error } = await supabase.storage.from('site-assets').remove([fileName]);
    return { success: !error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
