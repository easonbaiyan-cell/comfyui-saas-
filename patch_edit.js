const fs = require('fs');
let content = fs.readFileSync('src/app/admin/workflows/edit/[id]/page.tsx', 'utf8');

// Fix string casting for likes
content = content.replace(
  "(form.elements.namedItem('likes') as HTMLInputElement).value = wf.virtual_likes || '';",
  "(form.elements.namedItem('likes') as HTMLInputElement).value = wf.virtual_likes?.toString() || '';"
);

// Add value attributes to platform options
content = content.replace(
  "<option>无</option>\n                    <option>抖音</option>\n                    <option>小红书</option>",
  '<option value="无">无</option>\n                    <option value="抖音">抖音</option>\n                    <option value="小红书">小红书</option>'
);

fs.writeFileSync('src/app/admin/workflows/edit/[id]/page.tsx', content);
