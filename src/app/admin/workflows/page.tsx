'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction, getCategoriesAction, reorderWorkflowsAction, deleteWorkflowAction } from './actions';
import CategoryManagementModal from './CategoryManagementModal';

export default function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [nameSearch, setNameSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionToken(session.access_token);

          const [workflowsResult, categoriesResult] = await Promise.all([
            getWorkflowsAction(session.access_token),
            getCategoriesAction(session.access_token)
          ]);
          if (workflowsResult.success && workflowsResult.workflows) {
            setWorkflows(workflowsResult.workflows);
          } else {
            console.error('Failed to load workflows:', workflowsResult.error);
          }

          if (categoriesResult.success && categoriesResult.categories) {
            setCategories(categoriesResult.categories);
          } else {
            console.error('Failed to load categories:', categoriesResult.error);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      showToast('置顶操作失败', 'error');
    } else {
      showToast(currentPinStatus ? '已取消置顶' : '已成功置顶', 'success');
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
      showToast('上下架操作失败', 'error');
    } else {
      showToast(newStatus === 'published' ? '已成功上架' : '已成功下架', 'success');
    }
  };



  const handleMoveUp = async (index: number) => {
    if (!sessionToken || index === 0) return;
    const newWorkflows = [...workflows];
    const temp = newWorkflows[index - 1].sort_order;
    newWorkflows[index - 1].sort_order = newWorkflows[index].sort_order;
    newWorkflows[index].sort_order = temp;

    const itemTemp = newWorkflows[index - 1];
    newWorkflows[index - 1] = newWorkflows[index];
    newWorkflows[index] = itemTemp;

    setWorkflows(newWorkflows);

    const updates = [
      { id: newWorkflows[index - 1].id, sort_order: newWorkflows[index - 1].sort_order },
      { id: newWorkflows[index].id, sort_order: newWorkflows[index].sort_order }
    ];

    const result = await reorderWorkflowsAction(updates, sessionToken);
    if (!result.success) {
      showToast('排序失败', 'error');
      // A full refresh might be safer on failure
      const refresh = await getWorkflowsAction(sessionToken);
      if (refresh.success && refresh.workflows) setWorkflows(refresh.workflows);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!sessionToken || index === workflows.length - 1) return;
    const newWorkflows = [...workflows];
    const temp = newWorkflows[index + 1].sort_order;
    newWorkflows[index + 1].sort_order = newWorkflows[index].sort_order;
    newWorkflows[index].sort_order = temp;

    const itemTemp = newWorkflows[index + 1];
    newWorkflows[index + 1] = newWorkflows[index];
    newWorkflows[index] = itemTemp;

    setWorkflows(newWorkflows);

    const updates = [
      { id: newWorkflows[index + 1].id, sort_order: newWorkflows[index + 1].sort_order },
      { id: newWorkflows[index].id, sort_order: newWorkflows[index].sort_order }
    ];

    const result = await reorderWorkflowsAction(updates, sessionToken);
    if (!result.success) {
      showToast('排序失败', 'error');
      const refresh = await getWorkflowsAction(sessionToken);
      if (refresh.success && refresh.workflows) setWorkflows(refresh.workflows);
    }
  };

  const handleDelete = async (id: string) => {
    if (!sessionToken) return;
    if (!window.confirm('确定要删除这个工作流吗？此操作不可撤销。')) return;

    const originalWorkflows = [...workflows];
    setWorkflows(workflows.filter(wf => wf.id !== id));

    const result = await deleteWorkflowAction(id, sessionToken);
    if (!result.success) {
      setWorkflows(originalWorkflows);
      showToast('删除失败', 'error');
    } else {
      showToast('删除成功', 'success');
    }
  };

  return (
    <div className="p-8">
      {/* Global Toast Message */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100 ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {toastMessage.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{toastMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">商品与算力管理</h2>
          <p className="text-gray-500 mt-1">管理所有工作流商品、配置参数和算力映射。</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            管理分类 (Manage Categories)
          </button>
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
      </div>

      {/* Data Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">商品列表</h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="搜索工作流名称"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
                <select
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
                >
                  <option value="">所有分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

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
                  {(() => {
                    if (loading) {
                      return (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">加载中...</td>
                        </tr>
                      );
                    }

                    const filteredWorkflows = workflows.filter(wf => {
                      const matchName = !nameSearch || (wf.title && wf.title.toLowerCase().includes(nameSearch.toLowerCase()));
                      const matchCategory = !categorySearch || wf.category === categorySearch;
                      return matchName && matchCategory;
                    });

                    if (filteredWorkflows.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">暂无数据</td>
                        </tr>
                      );
                    }

                    return filteredWorkflows.map((workflow) => (
                      <tr key={String(workflow.id)} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{String(workflow.title)}</span>
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
                            onClick={() => handleMoveUp(workflows.indexOf(workflow))}
                            disabled={workflows.indexOf(workflow) === 0 || !!nameSearch || !!categorySearch}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="上移 (Move Up)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveDown(workflows.indexOf(workflow))}
                            disabled={workflows.indexOf(workflow) === workflows.length - 1 || !!nameSearch || !!categorySearch}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="下移 (Move Down)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTogglePin(String(workflow.id), workflow.is_pinned)}
                            className={`${workflow.is_pinned ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            {workflow.is_pinned ? '取消置顶' : '置顶'}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(String(workflow.id), workflow.status)}
                            className={`${workflow.status === 'published' ? 'text-gray-500 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {workflow.status === 'published' ? '下架' : '上架'}
                          </button>
                          <Link href={`/admin/workflows/edit/${String(workflow.id)}`} className="text-indigo-600 hover:text-indigo-900">编辑</Link>
                          <button
                            onClick={() => handleDelete(String(workflow.id))}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isCategoryModalOpen && sessionToken && (
        <CategoryManagementModal
          sessionToken={sessionToken}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
    </div>
  );
}
