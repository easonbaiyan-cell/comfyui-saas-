const fs = require('fs');
let code = fs.readFileSync('src/components/WorkflowGrid.tsx', 'utf-8');

// 1. Add Category interface
const interfaceCategory = `
interface Category {
  id: string;
  name: string;
  requiredTier: string;
}
`;
code = code.replace('interface Workflow {', interfaceCategory + '\ninterface Workflow {');

// 2. Remove const CATEGORIES
code = code.replace(/const CATEGORIES = \["推荐", "服装", "首饰", "跳舞", "诱惑"\];\n\n/g, '');

// 3. Update WorkflowGrid props and logic
const oldGridStart = `export function WorkflowGrid({ workflows }: { workflows: Workflow[] }) {
  const [activeCategory, setActiveCategory] = useState("推荐");`;

const newGridStart = `export function WorkflowGrid({ workflows, categories }: { workflows: Workflow[], categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].name : "");

  const filteredWorkflows = activeCategory
    ? workflows.filter(w => w.category === activeCategory)
    : workflows;`;

code = code.replace(oldGridStart, newGridStart);

// 4. Update the mapping of categories
const oldCatMap = `{CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="relative cursor-pointer py-2 group flex-shrink-0"
            onClick={() => setActiveCategory(cat)}
          >
            <div className="flex items-center gap-1">
              <span className={\`text-base font-medium transition-colors \${
                activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }\`}>
                {cat}
              </span>
              {cat === "诱惑" && (`;

const newCatMap = `{categories.map((cat) => (
          <div
            key={cat.id}
            className="relative cursor-pointer py-2 group flex-shrink-0"
            onClick={() => setActiveCategory(cat.name)}
          >
            <div className="flex items-center gap-1">
              <span className={\`text-base font-medium transition-colors \${
                activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }\`}>
                {cat.name}
              </span>
              {cat.requiredTier !== "free" && (`;

code = code.replace(oldCatMap, newCatMap);

// 5. Update active check for category loop
code = code.replace(/activeCategory === cat \?/g, 'activeCategory === cat.name ?');
code = code.replace(/activeCategory === cat && \(/g, 'activeCategory === cat.name && (');


// 6. Fix `workflows` to `filteredWorkflows` in the render array
const oldGridRender1 = `{!workflows.length ? (`;
const newGridRender1 = `{!filteredWorkflows.length ? (`;
code = code.replace(oldGridRender1, newGridRender1);

const oldGridRender2 = `{workflows.map((workflow) => (`;
const newGridRender2 = `{filteredWorkflows.map((workflow) => (`;
code = code.replace(oldGridRender2, newGridRender2);


fs.writeFileSync('src/components/WorkflowGrid.tsx', code);
