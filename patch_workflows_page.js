const fs = require('fs');
const path = 'src/app/admin/workflows/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import CategoryManagementModal
if (!content.includes('CategoryManagementModal')) {
    content = content.replace(
        "import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction, getCategoriesAction } from './actions';",
        "import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction, getCategoriesAction } from './actions';\nimport CategoryManagementModal from './CategoryManagementModal';"
    );
}

// 2. Add state
if (!content.includes('isCategoryModalOpen')) {
    content = content.replace(
        "const [sessionToken, setSessionToken] = useState<string | null>(null);",
        "const [sessionToken, setSessionToken] = useState<string | null>(null);\n  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);"
    );
}

// 3. Add Button
if (!content.includes('管理/新增分类')) {
    content = content.replace(
        '<Link\n          href="/admin/workflows/create"',
        '<button\n          onClick={() => setIsCategoryModalOpen(true)}\n          className="inline-flex items-center px-4 py-2 mr-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"\n        >\n          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">\n            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />\n          </svg>\n          管理/新增分类\n        </button>\n        <Link\n          href="/admin/workflows/create"'
    );
}

// 4. Add Modal at the end
if (!content.includes('isCategoryModalOpen}')) {
    content = content.replace(
        "</div>\n    </div>\n  );\n}",
        "</div>\n\n      {/* Category Modal */}\n      <CategoryManagementModal\n        isOpen={isCategoryModalOpen}\n        onClose={() => setIsCategoryModalOpen(false)}\n        onCategorySelected={(categoryName) => {\n          // Optionally handle selection, for now just close\n        }}\n      />\n    </div>\n  );\n}"
    );
}

fs.writeFileSync(path, content);
console.log('Patched page.tsx');
