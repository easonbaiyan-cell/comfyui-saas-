'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveUserUpload(accessToken: string, fileUrl: string, fileType: string) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      return { success: false, error: 'Unauthorized' };
    }

    const authResult = await supabase.auth.getUser(accessToken).catch(e => ({ data: { user: null }, error: e }));
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    if (authError || !user) {
      console.error('Unauthorized request to saveUserUpload');
      return { success: false, error: 'Unauthorized' };
    }
    const userId = user.id;

    const { error } = await supabase.from('user_uploads').insert({
      user_id: userId,
      file_url: fileUrl,
      file_type: fileType
    });

    if (error) {
      console.error('Error inserting user upload:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to save user upload:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserUploads(accessToken: string, type: 'image' | 'video') {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      return { success: false, data: [], error: '请先登录' };
    }

    const authResult = await supabase.auth.getUser(accessToken).catch(e => ({ data: { user: null }, error: e }));
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    if (authError || !user) {
      return { success: false, data: [], error: '请先登录' };
    }
    const userId = user.id;

    const { data, error } = await supabase.from('user_uploads')
      .select('id, file_url, file_type, created_at')
      .eq('user_id', userId)
      .like('file_type', `${type}/%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user uploads:', error);
      return { success: false, data: [], error: '获取失败' };
    }

    if (!data) return { success: true, data: [] };

    const mapped = data.map((record: any) => ({
      name: record.file_url ? record.file_url.split('/').pop() : 'unknown',
      url: record.file_url,
      updated_at: record.created_at
    }));
    return { success: true, data: mapped };

  } catch (error: any) {
    console.error('Failed to get user uploads:', error);
    return { success: false, data: [], error: '获取失败' };
  }
}

export async function deleteUserUpload(accessToken: string, fileUrl: string) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      return { success: false, error: 'Unauthorized' };
    }

    const authResult = await supabase.auth.getUser(accessToken).catch(e => ({ data: { user: null }, error: e }));
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = user.id;

    // Verify ownership and get record
    const { data: fileData, error: verifyError } = await supabase.from('user_uploads')
      .select('id, file_url')
      .eq('user_id', userId)
      .eq('file_url', fileUrl)
      .single();

    if (verifyError || !fileData) {
      return { success: false, error: 'Unauthorized or not found' };
    }

    // Extract fileName from URL to delete from bucket
    const urlParts = fileUrl.split('/');
    const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);

    // Delete from bucket
    const { error: storageError } = await supabase.storage.from('site-assets').remove([fileName]);
    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Still proceed to delete DB record if bucket deletion fails (e.g. file already gone)
    }

    // Delete DB record
    const { error: dbError } = await supabase.from('user_uploads').delete().eq('id', fileData.id);

    if (dbError) {
       console.error('Error deleting user upload record:', dbError);
       return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
