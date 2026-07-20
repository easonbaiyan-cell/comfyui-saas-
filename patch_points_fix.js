const fs = require('fs');
let code = fs.readFileSync('src/components/PointsModal.tsx', 'utf8');

// Add import that was missed
if (!code.includes('import { useSettingsStore }')) {
  code = code.replace(
    'import { BaseModal } from "./BaseModal";',
    'import { BaseModal } from "./BaseModal";\nimport { useSettingsStore } from "@/store/settings";'
  );
}

fs.writeFileSync('src/components/PointsModal.tsx', code);
