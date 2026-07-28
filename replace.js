const fs = require('fs');
const filepath = 'src/actions/userUploads.ts';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
  'const fileName = urlParts[urlParts.length - 1];',
  'const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);'
);

fs.writeFileSync(filepath, content);
