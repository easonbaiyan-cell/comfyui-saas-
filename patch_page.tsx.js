const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Fetch categories
const categoriesQuery = `
        const { data: wfs } = await supabase
          .from('workflows')
`;
const categoriesReplacement = `
        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (catsData) {
            categories = catsData.map(c => ({
              id: c.id,
              name: c.name,
              requiredTier: c.required_tier
            }));
        }

        const { data: wfs } = await supabase
          .from('workflows')
`;

code = code.replace(categoriesQuery, categoriesReplacement);

// 2. Add `let categories = [];`
const letCategories = `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];
`;
const letCategoriesReplacement = `
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];
`;
code = code.replace(letCategories, letCategoriesReplacement);

// 3. Pass categories to WorkflowGrid
const workflowGridStr = `<WorkflowGrid workflows={workflows} />`;
const workflowGridReplacement = `<WorkflowGrid workflows={workflows} categories={categories} />`;
code = code.replace(workflowGridStr, workflowGridReplacement);

// 4. Remove fallback workflows logic
const fallbackBlock = `
  // Dummy fallback workflows if DB is totally empty
  if (workflows.length === 0) {
    workflows = [
      {
        id: "1",
        runninghubId: "123",
        title: "FLUX.1 Pro Generator",
        description: "使用 FLUX.1 Pro 模型生成高质量图像。",
        coverImageUrl: "https://picsum.photos/600/800?random=1",
        category: "Image",
        creditCost: 15
      },
      {
        id: "2",
        runninghubId: "456",
        title: "Video Upscaler 4K",
        description: "使用 AI 将您的视频提升至 4K 分辨率。",
        coverImageUrl: "https://picsum.photos/600/800?random=2",
        category: "Video",
        creditCost: 45
      }
    ];
  }
`;
code = code.replace(fallbackBlock, '');

fs.writeFileSync('src/app/page.tsx', code);
