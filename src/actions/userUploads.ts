'use server'

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function extractUserId(accessToken: string, user: any) {
  if (user && user.id) return user.id;
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    const secretToken = process.env.ADMIN_SECRET_TOKEN;

    if (adminSession && secretToken && adminSession === secretToken) {
      const payloadBase64 = accessToken.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      return payload.sub;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function saveUserUpload(accessToken: string, fileUrl: string, fileType: string) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      return { success: false, error: 'Unauthorized' };
    }

    let authResult;
    try {
      authResult = await supabase.auth.getUser(accessToken);
    } catch (e) {
      authResult = { data: { user: null }, error: e };
    }
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    const userId = await extractUserId(accessToken, user);
    if (!userId) {
      console.error('Unauthorized request to saveUserUpload');
      return { success: false, error: 'Unauthorized' };
    }

    let insertError;
    try {
      const { error } = await supabase.from('user_uploads').insert({
        user_id: userId,
        file_url: fileUrl,
        file_type: fileType
      });
      insertError = error;
    } catch (e: any) {
      insertError = e;
    }

    if (insertError) {
      console.error('Error inserting user upload:', insertError);
      return { success: false, error: insertError.message || 'Insert failed' };
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

    let authResult;
    try {
      authResult = await supabase.auth.getUser(accessToken);
    } catch (e) {
      authResult = { data: { user: null }, error: e };
    }
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    const userId = await extractUserId(accessToken, user);
    if (!userId) {
      return { success: false, data: [], error: '请先登录' };
    }

    let data, fetchError;
    try {
      const result = await supabase.from('user_uploads')
        .select('id, file_url, file_type, created_at')
        .eq('user_id', userId)
        .like('file_type', `${type}/%`)
        .order('created_at', { ascending: false });
      data = result.data;
      fetchError = result.error;
    } catch (e: any) {
      fetchError = e;
    }

    if (fetchError) {
      console.error('Error fetching user uploads:', fetchError);
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

    let authResult;
    try {
      authResult = await supabase.auth.getUser(accessToken);
    } catch (e) {
      authResult = { data: { user: null }, error: e };
    }
    const user = authResult?.data?.user;
    const authError = authResult?.error;

    const userId = await extractUserId(accessToken, user);
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership and get record
    let fileData, verifyError;
    try {
      const result = await supabase.from('user_uploads')
        .select('id, file_url')
        .eq('user_id', userId)
        .eq('file_url', fileUrl)
        .single();
      fileData = result.data;
      verifyError = result.error;
    } catch (e: any) {
      verifyError = e;
    }

    if (verifyError || !fileData) {
      return { success: false, error: 'Unauthorized or not found' };
    }

    // Extract fileName from URL to delete from bucket
    const urlParts = fileUrl.split('/');
    const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);

    // Delete from bucket
    try {
      const { error: storageError } = await supabase.storage.from('site-assets').remove([fileName]);
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Still proceed to delete DB record if bucket deletion fails (e.g. file already gone)
      }
    } catch (e: any) {
      console.error('Exception deleting from storage:', e);
    }

    // Delete DB record
    let dbError;
    try {
      const result = await supabase.from('user_uploads').delete().eq('id', fileData.id);
      dbError = result.error;
    } catch (e: any) {
      dbError = e;
    }

    if (dbError) {
       console.error('Error deleting user upload record:', dbError);
       return { success: false, error: dbError.message || 'Delete failed' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
