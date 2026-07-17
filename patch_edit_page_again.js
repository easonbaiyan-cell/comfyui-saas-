const fs = require('fs');
const filePath = 'src/app/admin/workflows/edit/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Use proper import path for actions (it's two levels up)
content = content.replace(
  "import { createWorkflowAction, getCategoriesAction, createCategoryAction } from '../actions';",
  "import { updateWorkflowAction, getWorkflowAction, getCategoriesAction, createCategoryAction } from '../../actions';"
);

// Fix params type for Next.js 15
content = content.replace(
  "export default function CreateWorkflowPage() {",
  "import { use } from 'react';\n\nexport default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {\n  const resolvedParams = use(params);\n  const workflowId = resolvedParams.id;\n"
);

content = content.replace(
  "const [newCategoryTier, setNewCategoryTier] = useState('free');\n  const [selectedCategory, setSelectedCategory] = useState('');\n  const [isDirty, setIsDirty] = useState(false);",
  "const [newCategoryTier, setNewCategoryTier] = useState('free');\n  const [selectedCategory, setSelectedCategory] = useState('');\n  const [isDirty, setIsDirty] = useState(false);\n  const [initialDataLoaded, setInitialDataLoaded] = useState(false);\n  const formRef = React.useRef<HTMLFormElement>(null);"
);

content = content.replace(
  "import { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

const fetchWorkflowStr = `
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
            (form.elements.namedItem('description') as HTMLTextAreaElement).value = wf.description || '';
            (form.elements.namedItem('points') as HTMLInputElement).value = wf.cost_points || '';
            (form.elements.namedItem('appId') as HTMLInputElement).value = wf.r_app_id || '';

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
`;

content = content.replace(
  "const fetchCategories = async () => {",
  fetchWorkflowStr + "\n  const fetchCategories = async () => {"
);

content = content.replace(
  "fetchCategories();\n  }, []);",
  "fetchCategories();\n    fetchWorkflow();\n  }, [workflowId]);"
);

content = content.replace(
  "const handleCreateWorkflow = async (e: React.FormEvent<HTMLFormElement>) => {",
  "const handleUpdateWorkflow = async (e: React.FormEvent<HTMLFormElement>) => {"
);
content = content.replace(
  "onSubmit={handleCreateWorkflow}",
  "onSubmit={handleUpdateWorkflow}"
);
content = content.replace(
  "<form onSubmit={handleUpdateWorkflow}",
  "<form ref={formRef} onSubmit={handleUpdateWorkflow}"
);

content = content.replace(
  "const result = await createWorkflowAction(workflowData, token);",
  "const result = await updateWorkflowAction(workflowId, workflowData, token);"
);

content = content.replace(
  "showToast('发布成功！即将返回列表...');\n          setTimeout(() => {\n            router.push('/admin/workflows');\n          }, 1500);",
  "showToast('更新成功！即将返回列表...');\n          setTimeout(() => {\n            router.push('/admin/workflows');\n          }, 1500);"
);

content = content.replace(
  "发布新工作流 (New Workflow)",
  "编辑工作流 (Edit Workflow)"
);

content = content.replace(
  "填写基础信息和图文素材，发布新的生成能力。",
  "修改工作流的基础信息和配置。"
);

content = content.replace(
  "立即发布",
  "保存修改"
);

content = content.replace(
  "发布新工作流",
  "编辑工作流"
);

fs.writeFileSync(filePath, content);
