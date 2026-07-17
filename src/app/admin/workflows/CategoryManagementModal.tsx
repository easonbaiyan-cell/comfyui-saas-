'use client';

import React, { useState, useEffect } from 'react';
import { getCategoriesAction, createCategoryAction, deleteCategoryAction, reorderCategoriesAction } from './actions';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  required_tier: string;
  sort_order: number;
  created_at: string;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelected: (categoryName: string) => void;
}

export default function CategoryManagementModal({ isOpen, onClose, onCategorySelected }: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'add'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryTier, setNewCategoryTier] = useState('free');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setViewMode('list');
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const res = await getCategoriesAction(session.access_token);
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const result = await createCategoryAction(newCategoryName, newCategoryTier, session.access_token);
      if (result.success) {
        onCategorySelected(newCategoryName);
        setNewCategoryName('');
        setNewCategoryTier('free');
        await fetchCategories();
        setViewMode('list');
      } else {
        alert('Failed to create category: ' + result.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('确定要删除这个分类吗？(Are you sure?)')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Optimistic update
      setCategories(categories.filter(c => c.id !== categoryId));

      const result = await deleteCategoryAction(categoryId, session.access_token);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (e: any) {
      alert('Failed to delete category: ' + e.message);
      fetchCategories(); // Revert on failure
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCategories = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap elements in the array
    [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];

    // Update sort_order based on the new array indices
    const updatedCategories = newCategories.map((c, i) => ({ ...c, sort_order: i }));

    // Optimistic update
    setCategories(updatedCategories);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Prepare updates payload
      const updates = updatedCategories.map(c => ({ id: c.id, sort_order: c.sort_order }));
      const result = await reorderCategoriesAction(updates, session.access_token);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (e: any) {
      alert('Failed to reorder categories: ' + e.message);
      fetchCategories(); // Revert on failure
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    分类管理中心 (Category Management)
                  </h3>
                  {viewMode === 'list' ? (
                    <button onClick={() => setViewMode('add')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      新增分类 (Add New)
                    </button>
                  ) : (
                    <button onClick={() => setViewMode('list')} className="text-sm text-indigo-600 hover:text-indigo-500">
                      返回列表 (Back to List)
                    </button>
                  )}
                </div>

                {viewMode === 'list' && (
                  <div className="mt-4">
                    {isLoading ? (
                      <div className="text-center py-4 text-gray-500">加载中... (Loading...)</div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">暂无分类 (No categories found)</div>
                    ) : (
                      <ul className="divide-y divide-gray-200 border rounded-md">
                        {categories.map((category, index) => (
                          <li key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{category.name}</p>
                              <p className="text-xs text-gray-500">可见等级: {category.required_tier === 'free' ? '免费' : category.required_tier === 'month' ? '包月' : '包年'}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="上移 (Move Up)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === categories.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="下移 (Move Down)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="text-red-400 hover:text-red-600 ml-2"
                                title="删除 (Delete)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {viewMode === 'add' && (
                  <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700">分类名称 (Name)</label>
                      <input type="text" id="newCategoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="newCategoryTier" className="block text-sm font-medium text-gray-700">可见会员等级 (Required Tier)</label>
                      <select id="newCategoryTier" value={newCategoryTier} onChange={(e) => setNewCategoryTier(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                        <option value="free">免费用户 (Free)</option>
                        <option value="month">基础包月 (Monthly)</option>
                        <option value="year">连续包年 (Yearly)</option>
                      </select>
                    </div>
                    <div className="pt-4 flex flex-row-reverse">
                      <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        {isSubmitting ? '保存中...' : '保存并返回 (Save & Return)'}
                      </button>
                      <button type="button" onClick={() => setViewMode('list')} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        取消 (Cancel)
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse">
              <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                关闭 (Close)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
