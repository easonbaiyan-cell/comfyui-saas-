'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createWorkflowAction } from '../actions';
import { supabase } from '@/lib/supabase';

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState([{ id: 1, uiName: '', jsonNode: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMapping = () => {
    setMappings([...mappings, { id: Date.now(), uiName: '', jsonNode: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get('title'),
      description: formData.get('subtitle'),
      category: formData.get('category'),
      cover_url: '', // Note: Handle actual upload if needed
      cost_points: formData.get('points'),
      r_app_id: formData.get('appId'),
      r_submit_url: formData.get('submitUrl'),
      r_query_url: formData.get('queryUrl'),
      node_mapping: mappings.map(m => ({ uiName: m.uiName, jsonNode: m.jsonNode })),
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

  const removeMapping = (id: number) => {
    if (mappings.length > 1) {
      setMappings(mappings.filter(m => m.id !== id));
    }
  };

  const updateMapping = (id: number, field: 'uiName' | 'jsonNode', value: string) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
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
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">工作流名称</label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="例如：高级人像修图" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">选择分类</label>
                <div className="mt-1">
                  <select id="category" name="category" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                    <option>摄影</option>
                    <option>二次元</option>
                    <option>视频超分</option>
                    <option>其他</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">副标题描述</label>
                <div className="mt-1">
                  <input type="text" name="subtitle" id="subtitle" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="简短描述该工作流的作用..." />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">封面图上传区</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        点击上传
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">演示视频 URL</label>
                <div className="mt-1">
                  <input type="url" name="videoUrl" id="videoUrl" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="https://" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700">前台显示的虚拟平台标识</label>
                <div className="mt-1">
                  <select id="platform" name="platform" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                    <option>无</option>
                    <option>抖音</option>
                    <option>小红书</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="likes" className="block text-sm font-medium text-gray-700">虚拟点赞数</label>
                <div className="mt-1">
                  <input type="number" name="likes" id="likes" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="0" />
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
              <div className="sm:col-span-3">
                <label htmlFor="submitUrl" className="block text-sm font-medium text-gray-700">R 端 API 提交地址</label>
                <div className="mt-1">
                  <input type="url" name="submitUrl" id="submitUrl" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="https://" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="queryUrl" className="block text-sm font-medium text-gray-700">R 端 API 查询地址</label>
                <div className="mt-1">
                  <input type="url" name="queryUrl" id="queryUrl" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="https://" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="appId" className="block text-sm font-medium text-gray-700">RunningHub 工作流 ID (App ID)</label>
                <div className="mt-1">
                  <input type="text" name="appId" id="appId" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono" placeholder="app-..." />
                </div>
              </div>
            </div>

            {/* Parameter Mapping Area */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">参数映射区 (核心)</h4>
                <button
                  type="button"
                  onClick={addMapping}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  + 添加映射
                </button>
              </div>
              <div className="space-y-4">
                {mappings.map((mapping, index) => (
                  <div key={mapping.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={mapping.uiName}
                        onChange={(e) => updateMapping(mapping.id, 'uiName', e.target.value)}
                        placeholder="UI 字段名 (例: 正向提示词)"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={mapping.jsonNode}
                        onChange={(e) => updateMapping(mapping.id, 'jsonNode', e.target.value)}
                        placeholder="JSON 节点 (例: 6.inputs.text)"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-mono text-gray-600"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeMapping(mapping.id)}
                        disabled={mappings.length === 1}
                        className={`p-2 rounded-md ${mappings.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}
