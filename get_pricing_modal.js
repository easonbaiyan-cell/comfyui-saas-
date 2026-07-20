const fs = require('fs');
console.log(fs.readFileSync('src/components/PricingModal.tsx', 'utf8').substring(0, 1000));
