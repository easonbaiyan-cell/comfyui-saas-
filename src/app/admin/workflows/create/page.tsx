'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createWorkflowAction } from '../actions';
import { supabase } from '@/lib/supabase';

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
      subtitle2: formData.get('subtitle2'),
      description: formData.get('subtitle'),
      r_app_id: formData.get('appId'),
      cost_points: formData.get('costPoints'),
      node_mapping: [],
      rh_payload_template: parsedPayloadTemplate,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const result = await createWorkflowAction(payload, session.access_token);
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
      <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">发布新工作流</h2>
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
              <div className="sm:col-span-6">
                <label htmlFor="subtitle2" className="block text-sm font-medium text-gray-700">副标题2</label>
                <div className="mt-1">
                  <input type="text" name="subtitle2" id="subtitle2" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="输入副标题2..." />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">工作流名称</label>
                <div className="mt-1">
                  <input type="text" name="title" id="title" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="例如：高级人像修图" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">副标题描述 (Optional)</label>
                <div className="mt-1">
                  <input type="text" name="subtitle" id="subtitle" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="简短描述该工作流的作用..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block B: Backend Compute Bridge */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">区块 B：底层算力桥接</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="appId" className="block text-sm font-medium text-gray-700">底层应用 ID (App ID)</label>
                <div className="mt-1">
                  <input type="text" name="appId" id="appId" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono" placeholder="app-..." />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="costPoints" className="block text-sm font-medium text-gray-700">单次生成消耗积分 (Cost Points)</label>
                <div className="mt-1">
                  <input type="number" name="costPoints" id="costPoints" required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono" placeholder="例如：10" defaultValue={10} />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="rh_payload_template" className="block text-sm font-medium text-gray-700">算力节点配置 (JSON Payload)</label>
                <div className="mt-1">
                  <textarea name="rh_payload_template" id="rh_payload_template" rows={10} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono bg-gray-50" placeholder='[{"nodeId":"123","type":"image","value":""}]'></textarea>
                </div>
                <p className="mt-2 text-sm text-gray-500">直接粘贴底层算力平台复制出的 nodeInfoList JSON 数组。</p>
              </div>
            </div>

          </div>
        </div>
        </div>
      </form>
    </div>
  );
}
