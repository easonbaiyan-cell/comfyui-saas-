const fs = require('fs');
const path = 'src/app/admin/workflows/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// We used workflows.indexOf(workflow) which gets the index in the *global* workflows array.
// But the UI might show filtered workflows. Let's fix this so it passes the filtered workflows to handleMoveUp and uses the original index from the main array.

content = content.replace(
  "onClick={() => handleMoveUp(workflows.indexOf(workflow))}",
  "onClick={() => handleMoveUp(workflows.findIndex(w => w.id === workflow.id))}"
);
content = content.replace(
  "disabled={workflows.indexOf(workflow) === 0}",
  "disabled={workflows.findIndex(w => w.id === workflow.id) === 0}"
);

content = content.replace(
  "onClick={() => handleMoveDown(workflows.indexOf(workflow))}",
  "onClick={() => handleMoveDown(workflows.findIndex(w => w.id === workflow.id))}"
);
content = content.replace(
  "disabled={workflows.indexOf(workflow) === workflows.length - 1}",
  "disabled={workflows.findIndex(w => w.id === workflow.id) === workflows.length - 1}"
);

fs.writeFileSync(path, content);
console.log('Fixed button indexing');
