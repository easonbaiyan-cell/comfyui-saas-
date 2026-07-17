const fs = require('fs');
let content = fs.readFileSync('src/app/admin/workflows/CategoryManagementModal.tsx', 'utf8');

// 1. Add updateCategoryAction import
content = content.replace(
  "import { getCategoriesAction, createCategoryAction, deleteCategoryAction, reorderCategoriesAction } from './actions';",
  "import { getCategoriesAction, createCategoryAction, deleteCategoryAction, reorderCategoriesAction, updateCategoryAction } from './actions';"
);

// 2. Add state variables for edit mode
content = content.replace(
  "const [viewMode, setViewMode] = useState<'list' | 'add'>('list');",
  "const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');\n  const [editingCategoryId, setEditingCategoryId] = useState('');"
);

// 3. Add handleUpdateCategory function
const handleUpdateFn = `
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !editingCategoryId) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const result = await updateCategoryAction(editingCategoryId, newCategoryName, newCategoryTier, session.access_token);
      if (result.success) {
        onCategorySelected(newCategoryName);
        await fetchCategories();
        setViewMode('list');
      } else {
        alert('Failed to update category: ' + result.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };
`;
content = content.replace(
  "const handleDelete = async (categoryId: string) => {",
  handleUpdateFn + "\n  const handleDelete = async (categoryId: string) => {"
);

// 4. Update Chinese labels mapping in list view
content = content.replace(
  /<p className="text-xs text-gray-500">可见等级: \{category\.required_tier === 'free' \? '免费' : category\.required_tier === 'month' \? '包月' : '包年'\}<\/p>/g,
  `<p className="text-xs text-gray-500">可见等级: {category.required_tier === 'free' ? '免费 (Free)' : category.required_tier === 'month' ? '包月 (Monthly)' : category.required_tier === 'continuous_month' ? '连续包月 (Continuous Monthly)' : '包年 (Yearly)'}</p>`
);

// 5. Add edit button next to delete
content = content.replace(
  /<button\s*onClick=\{\(\) => handleDelete\(category\.id\)\}\s*className="text-red-400 hover:text-red-600 ml-2"/g,
  `<button
                                onClick={() => {
                                  setEditingCategoryId(category.id);
                                  setNewCategoryName(category.name);
                                  setNewCategoryTier(category.required_tier);
                                  setViewMode('edit');
                                }}
                                className="text-blue-400 hover:text-blue-600 ml-2"
                                title="编辑 (Edit)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="text-red-400 hover:text-red-600 ml-2"`
);

// 6. Fix header logic for edit mode
content = content.replace(
  "新增分类 (Add New)",
  "新增分类 (Add New)"
);

// 7. Render edit form
const editForm = `
                {viewMode === 'edit' && (
                  <form onSubmit={handleUpdateCategory} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700">分类名称 (Name)</label>
                      <input type="text" id="editCategoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                    </div>
                    <div>
                      <label htmlFor="editCategoryTier" className="block text-sm font-medium text-gray-700">可见会员等级 (Required Tier)</label>
                      <select id="editCategoryTier" value={newCategoryTier} onChange={(e) => setNewCategoryTier(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white">
                        <option value="free">免费 (Free)</option>
                        <option value="month">包月 (Monthly)</option>
                        <option value="continuous_month">连续包月 (Continuous Monthly)</option>
                        <option value="year">包年 (Yearly)</option>
                      </select>
                    </div>
                    <div className="pt-4 flex flex-row-reverse">
                      <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        {isSubmitting ? '保存中...' : '保存修改 (Save Changes)'}
                      </button>
                      <button type="button" onClick={() => setViewMode('list')} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        取消 (Cancel)
                      </button>
                    </div>
                  </form>
                )}
`;
content = content.replace(
  "{viewMode === 'add' && (",
  editForm + "\n                {viewMode === 'add' && ("
);

// 8. Update options in 'add' form
const oldOptions = `<option value="free">免费用户 (Free)</option>
                        <option value="month">基础包月 (Monthly)</option>
                        <option value="year">连续包年 (Yearly)</option>`;
const newOptions = `<option value="free">免费 (Free)</option>
                        <option value="month">包月 (Monthly)</option>
                        <option value="continuous_month">连续包月 (Continuous Monthly)</option>
                        <option value="year">包年 (Yearly)</option>`;
content = content.replace(oldOptions, newOptions);

fs.writeFileSync('src/app/admin/workflows/CategoryManagementModal.tsx', content);
