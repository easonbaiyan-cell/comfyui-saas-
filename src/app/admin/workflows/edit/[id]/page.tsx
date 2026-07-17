'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateWorkflowAction, getWorkflowAction, getCategoriesAction, createCategoryAction } from '../../actions';
import { supabase } from '@/lib/supabase';
import CategoryManagementModal from '../../CategoryManagementModal';

import { use } from 'react';

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const workflowId = resolvedParams.id;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [coverUrl, setCoverUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToastMessage({ message, type });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (toastMessage) {
      timeoutId = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);


  const fetchWorkflow = async () => {
    try {
      const sessionResult = await supabase.auth.getSession();
      const token = sessionResult.data.session?.access_token;
      if (token) {
        const wfResult = await getWorkflowAction(workflowId, token);
        if (wfResult.success && wfResult.workflow) {
          const wf = wfResult.workflow;
          setSelectedCategory(wf.category || '');
          setCoverUrl(wf.cover_url || '');
          setVideoUrl(wf.video_url || '');

          const form = formRef.current;
          if (form) {
            (form.elements.namedItem('title') as HTMLInputElement).value = wf.title || '';
            (form.elements.namedItem('subtitle') as HTMLInputElement).value = wf.description || '';
            (form.elements.namedItem('points') as HTMLInputElement).value = wf.cost_points || '';
            (form.elements.namedItem('appId') as HTMLInputElement).value = wf.r_app_id || '';
            (form.elements.namedItem('platform') as HTMLSelectElement).value = wf.virtual_platform || '无';
            (form.elements.namedItem('likes') as HTMLInputElement).value = wf.virtual_likes?.toString() || '';

            const rhPayload = typeof wf.rh_payload_template === 'string' ? wf.rh_payload_template : JSON.stringify(wf.rh_payload_template, null, 2);
            (form.elements.namedItem('rh_payload_template') as HTMLTextAreaElement).value = rhPayload || '';
          }
        } else {
          showToast('获取工作流信息失败: ' + (wfResult.error || 'Unknown error'), 'error');
        }
      }
    } catch (err) {
      console.error('Error fetching workflow:', err);
    } finally {
      setInitialDataLoaded(true);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await getCategoriesAction(session.access_token);
      if (res.success && res.categories) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setSelectedCategory((prev) => prev || res.categories![0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchWorkflow();
  }, [workflowId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Find the closest anchor tag that was clicked
      const target = (e.target as Element).closest('a');

      // If it's a link, we have unsaved changes, and the user cancels the navigation, prevent it
      if (target && isDirty) {
        if (!window.confirm('您的数据尚未保存，确定要离开吗？')) {
          e.preventDefault();
        }
      }
    };

    // Use capture phase to ensure this runs before any Next.js client-side navigation handles the click
    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, [isDirty]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'cover') setIsUploadingCover(true);
      if (type === 'video') setIsUploadingVideo(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      if (type === 'cover') setCoverUrl(publicUrl);
      if (type === 'video') setVideoUrl(publicUrl);
      showToast('上传成功');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      showToast(`上传失败，请稍后重试（系统提示：${errMsg}）`, 'error');
    } finally {
      if (type === 'cover') setIsUploadingCover(false);
      if (type === 'video') setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDirty(false); // Reset on submit
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    let parsedPayloadTemplate = [];
    const payloadTemplateString = formData.get('rh_payload_template') as string;

    if (payloadTemplateString && payloadTemplateString.trim() !== '') {
      try {
        parsedPayloadTemplate = JSON.parse(payloadTemplateString);
      } catch (e) {
        showToast('JSON 格式不合法', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      title: formData.get('title'),
      description: formData.get('subtitle'),
      category: formData.get('category'),
      cover_url: coverUrl,
      video_url: videoUrl,
      cost_points: formData.get('points'),
      virtual_platform: formData.get('platform'),
      virtual_likes: formData.get('likes'),
      r_app_id: formData.get('appId'),
      node_mapping: [],
      rh_payload_template: parsedPayloadTemplate,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const result = await updateWorkflowAction(workflowId, payload, session.access_token);
      if (result.success) {
        router.push('/admin/workflows');
      } else {
        alert('Failed to create workflow: ' + result.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toastMessage.message}
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} onChange={() => setIsDirty(true)}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">编辑工作流</h2>
            <p className="text-gray-500 mt-1">配置前台展示信息并映射底层算力节点。</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/admin/workflows"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '保存并发布'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Block A: Frontend Display */}
          <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">区块 A：前台展示包装 (面向用户)</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">工作流名称</label>
                <div className="mt-1">
                  <input type="text" name="title" id="title" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="例如：高级人像修图" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">选择分类</label>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCategoryModalOpen(true); }} className="text-sm text-indigo-600 hover:text-indigo-500">管理/新增分类</button>
                </div>
                <div className="mt-1">
                  <select id="category" name="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && <option value="">暂无分类</option>}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">副标题描述 (Optional)</label>
                <div className="mt-1">
                  <input type="text" name="subtitle" id="subtitle" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="简短描述该工作流的作用..." />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图上传 (Cover)</label>
                <div className="relative aspect-[9/16] w-full max-w-[200px] border-2 border-gray-300 border-dashed rounded-md overflow-hidden bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      {isUploadingCover ? (
                        <div className="flex flex-col items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-500">上传中...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-1 text-sm text-indigo-600 font-medium">点击上传图片</p>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'cover')} disabled={isUploadingCover} />
                </div>
                <input type="hidden" name="coverUrl" value={coverUrl} />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">演示视频上传 (Reference Video)</label>
                <div className="relative aspect-[9/16] w-full max-w-[200px] border-2 border-gray-300 border-dashed rounded-md overflow-hidden bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                  {videoUrl ? (
                    <video src={videoUrl} autoPlay loop muted playsInline controls onClick={(e) => e.stopPropagation()} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      {isUploadingVideo ? (
                        <div className="flex flex-col items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-500">上传中...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-indigo-600 font-medium">点击上传视频</p>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'video')} disabled={isUploadingVideo} />
                </div>
                <input type="hidden" name="videoUrl" value={videoUrl} />
              </div>

              <div className="sm:col-span-6">
                <p className="text-sm text-gray-500 text-center">建议比例 9:16，支持 JPG/PNG/MP4，不超过 50MB</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700">前台显示的虚拟平台标识</label>
                <div className="mt-1">
                  <select id="platform" name="platform" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                    <option value="无">无</option>
                    <option value="抖音">抖音</option>
                    <option value="小红书">小红书</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="likes" className="block text-sm font-medium text-gray-700">虚拟点赞数</label>
                <div className="mt-1">
                  <input type="number" name="likes" id="likes" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="输入纯数字，如 150000" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">单次生成消耗积分</label>
                <div className="mt-1">
                  <input type="number" name="points" id="points" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block B: Backend Compute Bridge */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">区块 B：底层算力桥接 (对接 RunningHub)</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="appId" className="block text-sm font-medium text-gray-700">RunningHub 工作流 ID (App ID)</label>
                <div className="mt-1">
                  <input type="text" name="appId" id="appId" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono" placeholder="app-..." />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="rh_payload_template" className="block text-sm font-medium text-gray-700">RunningHub 节点配置 (JSON Payload)</label>
                <div className="mt-1">
                  <textarea name="rh_payload_template" id="rh_payload_template" rows={10} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono bg-gray-50" placeholder='[{"nodeId":"123","type":"image","value":""}]'></textarea>
                </div>
                <p className="mt-2 text-sm text-gray-500">直接粘贴 R 平台复制出的 nodeInfoList JSON 数组。</p>
              </div>
            </div>

          </div>
        </div>
        </div>
      </form>

      {/* Category Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategorySelected={(categoryName) => {
          setSelectedCategory(categoryName);
          fetchCategories();
        }}
      />
    </div>
  );
}
