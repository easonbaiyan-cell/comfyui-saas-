const fs = require('fs');
let code = fs.readFileSync('src/components/PricingModal.tsx', 'utf-8');

// replace exact string of selected plan state
const scale105 = "scale-[1.05] ";
code = code.replace(/scale-\[1\.05\] /g, "");

fs.writeFileSync('src/components/PricingModal.tsx', code);
