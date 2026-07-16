const fs = require('fs');
const filePath = 'src/app/workflow/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// In Next.js 15, route params must be typed as a Promise and unwrapped using React.use()
content = content.replace(
  "export default function WorkflowDetailPage({ params }: { params: { id: string } }) {",
  "import { use } from 'react';\n\nexport default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {"
);
content = content.replace(
  "const { id: workflowId } = params;",
  "const resolvedParams = use(params);\n  const { id: workflowId } = resolvedParams;"
);
// Remove existing import if React.use() is duplicate
content = content.replace(
  "import React, { useState, useRef, useEffect } from 'react';",
  "import React, { useState, useRef, useEffect } from 'react';"
);

fs.writeFileSync(filePath, content);
