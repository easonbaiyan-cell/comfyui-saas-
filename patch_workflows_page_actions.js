const fs = require('fs');
const path = 'src/app/admin/workflows/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import actions
if (!content.includes('deleteWorkflowAction')) {
    content = content.replace(
        "import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction, getCategoriesAction } from './actions';",
        "import { getWorkflowsAction, togglePinWorkflowAction, toggleStatusWorkflowAction, getCategoriesAction, deleteWorkflowAction, reorderWorkflowsAction } from './actions';"
    );
}

// 2. Add handle methods
const methodsToAdd = `
  const handleDelete = async (id: string, title: string) => {
    if (!sessionToken) return;
    if (!confirm(\`确定要删除工作流 "\${title}" 吗？此操作不可撤销。\`)) return;

    const originalWorkflows = [...workflows];
    setWorkflows(workflows.filter(wf => String(wf.id) !== id));

    const result = await deleteWorkflowAction(id, sessionToken);
    if (!result.success) {
      console.error('Failed to delete workflow:', result.error);
      setWorkflows(originalWorkflows);
      showToast('删除失败', 'error');
    } else {
      showToast('已成功删除', 'success');
      // Refresh to ensure sync
      const fetchResult = await getWorkflowsAction(sessionToken);
      if (fetchResult.success && fetchResult.workflows) {
        setWorkflows(fetchResult.workflows);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!sessionToken || index <= 0) return;
    const originalWorkflows = [...workflows];
    const newWorkflows = [...workflows];

    const currentWf = newWorkflows[index];
    const prevWf = newWorkflows[index - 1];

    // Ensure they have valid sort_orders
    const currentOrder = currentWf.sort_order ?? index;
    const prevOrder = prevWf.sort_order ?? (index - 1);

    // Swap them in the local state immediately
    const temp = newWorkflows[index];
    newWorkflows[index] = newWorkflows[index - 1];
    newWorkflows[index - 1] = temp;

    // Assign swapped sort orders
    newWorkflows[index - 1] = { ...newWorkflows[index - 1], sort_order: prevOrder };
    newWorkflows[index] = { ...newWorkflows[index], sort_order: currentOrder };

    setWorkflows(newWorkflows);

    try {
      const updates = [
        { id: String(currentWf.id), sort_order: prevOrder },
        { id: String(prevWf.id), sort_order: currentOrder }
      ];
      const result = await reorderWorkflowsAction(updates, sessionToken);
      if (!result.success) throw new Error(result.error);

      const fetchResult = await getWorkflowsAction(sessionToken);
      if (fetchResult.success && fetchResult.workflows) setWorkflows(fetchResult.workflows);
    } catch (e: any) {
      console.error('Failed to move up:', e);
      setWorkflows(originalWorkflows);
      showToast('上移失败', 'error');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!sessionToken || index >= workflows.length - 1) return;
    const originalWorkflows = [...workflows];
    const newWorkflows = [...workflows];

    const currentWf = newWorkflows[index];
    const nextWf = newWorkflows[index + 1];

    const currentOrder = currentWf.sort_order ?? index;
    const nextOrder = nextWf.sort_order ?? (index + 1);

    // Swap in state
    const temp = newWorkflows[index];
    newWorkflows[index] = newWorkflows[index + 1];
    newWorkflows[index + 1] = temp;

    // Assign swapped sort orders
    newWorkflows[index + 1] = { ...newWorkflows[index + 1], sort_order: nextOrder };
    newWorkflows[index] = { ...newWorkflows[index], sort_order: currentOrder };

    setWorkflows(newWorkflows);

    try {
      const updates = [
        { id: String(currentWf.id), sort_order: nextOrder },
        { id: String(nextWf.id), sort_order: currentOrder }
      ];
      const result = await reorderWorkflowsAction(updates, sessionToken);
      if (!result.success) throw new Error(result.error);

      const fetchResult = await getWorkflowsAction(sessionToken);
      if (fetchResult.success && fetchResult.workflows) setWorkflows(fetchResult.workflows);
    } catch (e: any) {
      console.error('Failed to move down:', e);
      setWorkflows(originalWorkflows);
      showToast('下移失败', 'error');
    }
  };
`;

if (!content.includes('handleDelete')) {
    content = content.replace(
        "const handleToggleStatus = async (id: string, currentStatus: string) => {",
        methodsToAdd + "\n  const handleToggleStatus = async (id: string, currentStatus: string) => {"
    );
}

// 3. Add UI Buttons
const buttonsToReplace = `
                          <button
                            onClick={() => handleToggleStatus(String(workflow.id), workflow.status)}
                            className={\`\${workflow.status === 'published' ? 'text-gray-500 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}\`}
                          >
                            {workflow.status === 'published' ? '下架' : '上架'}
                          </button>
                          <Link href={\`/admin/workflows/edit/\${String(workflow.id)}\`} className="text-indigo-600 hover:text-indigo-900">编辑</Link>
                        </td>`;

const buttonsToAdd = `
                          <button
                            onClick={() => handleToggleStatus(String(workflow.id), workflow.status)}
                            className={\`\${workflow.status === 'published' ? 'text-gray-500 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}\`}
                          >
                            {workflow.status === 'published' ? '下架' : '上架'}
                          </button>
                          <Link href={\`/admin/workflows/edit/\${String(workflow.id)}\`} className="text-indigo-600 hover:text-indigo-900">编辑</Link>

                          <button
                            onClick={() => handleMoveUp(workflows.indexOf(workflow))}
                            disabled={workflows.indexOf(workflow) === 0}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            上移
                          </button>
                          <button
                            onClick={() => handleMoveDown(workflows.indexOf(workflow))}
                            disabled={workflows.indexOf(workflow) === workflows.length - 1}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            下移
                          </button>
                          <button
                            onClick={() => handleDelete(String(workflow.id), workflow.title)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>`;

content = content.replace(buttonsToReplace, buttonsToAdd);

fs.writeFileSync(path, content);
console.log('Patched page.tsx methods and buttons');
