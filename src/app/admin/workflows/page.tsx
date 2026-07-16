'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction } from './actions';

export default function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionToken(session.access_token);
          const result = await getWorkflowsAction(session.access_token);
          if (result.success && result.workflows) {
            setWorkflows(result.workflows);
          } else {
            console.error('Failed to load workflows:', result.error);
          }
        }
      } catch (err) {
        console.error('Error fetching workflows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    if (!sessionToken) return;

    // Optimistic update
    setWorkflows(workflows.map(wf => wf.id === id ? { ...wf, is_pinned: !currentPinStatus } : wf));

    const result = await togglePinWorkflowAction(id, currentPinStatus, sessionToken);
    if (!result.success) {
      console.error('Failed to toggle pin:', result.error);
      // Revert on failure
      setWorkflows(workflows.map(wf => wf.id === id ? { ...wf, is_pinned: currentPinStatus } : wf));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (!sessionToken) return;

    const newStatus = currentStatus === 'published' ? 'offline' : 'published';

    // Optimistic update
    setWorkflows(workflows.map(wf => wf.id === id ? { ...wf, status: newStatus } : wf));

    const result = await toggleStatusWorkflowAction(id, currentStatus, sessionToken);
    if (!result.success) {
      console.error('Failed to toggle status:', result.error);
      // Revert on failure
      setWorkflows(workflows.map(wf => wf.id === id ? { ...wf, status: currentStatus } : wf));
    }
  };

  return (
    <div className="p-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">商品与算力管理</h2>
          <p className="text-gray-500 mt-1">管理所有工作流商品、配置参数和算力映射。</p>
        </div>
        <Link
          href="/admin/workflows/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          发布新工作流 (Add Workflow)
        </Link>
      </div>

      {/* Data Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工作流名称
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      所属分类
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      R 端工作流 ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      单次消耗积分
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      当前状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总调用次数
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">加载中...</td>
                    </tr>
                  ) : workflows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">暂无数据</td>
                    </tr>
                  ) : workflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{workflow.title}</span>
                          {workflow.is_pinned && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              置顶
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{workflow.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{workflow.r_app_id || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.cost_points} 积分
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          workflow.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workflow.status === 'published' ? '上架' : '下架'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.usage_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button
                          onClick={() => handleTogglePin(workflow.id, workflow.is_pinned)}
                          className={`${workflow.is_pinned ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          {workflow.is_pinned ? '取消置顶' : '置顶'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                          className={`${workflow.status === 'published' ? 'text-gray-500 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {workflow.status === 'published' ? '下架' : '上架'}
                        </button>
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">编辑</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
