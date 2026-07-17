const fs = require('fs');
let code = fs.readFileSync('src/app/workflow/[id]/page.tsx', 'utf-8');

// Fix: Types of property 'params' are incompatible. Type '{ id: string; }' is missing the following properties from type 'Promise<any>'
// In Next.js 15, `params` is a Promise.
const oldParamsDef = `export default function WorkflowPage({ params }: { params: { id: string } }) {`;
const newParamsDef = `export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {`;
code = code.replace(oldParamsDef, newParamsDef);

// Also need to use React.use() to unwrap params if Next.js 15
// `const { id } = React.use(params);`
const oldDestructure = `export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params;`;
const newDestructure = `export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);`;
code = code.replace(oldDestructure, newDestructure);

// Let's also fix the effect setState issue by moving setElapsedTime(0) out of the effect (we can set it right when we set isGenerating = true instead).
const handleGenStart = `const handleGenerate = async () => {`;
const newHandleGenStart = `const handleGenerate = async () => {
    setElapsedTime(0);`;
code = code.replace(handleGenStart, newHandleGenStart);

const oldEffectLine = `if (isGenerating) {
      setElapsedTime(0);`;
const newEffectLine = `if (isGenerating) {`;
code = code.replace(oldEffectLine, newEffectLine);

fs.writeFileSync('src/app/workflow/[id]/page.tsx', code);
