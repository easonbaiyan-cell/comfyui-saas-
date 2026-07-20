const fs = require('fs');
let code = fs.readFileSync('src/components/PointsModal.tsx', 'utf8');

if (!code.includes('useSettingsStore')) {
  code = code.replace(
    'import { BaseModal } from "./BaseModal";',
    'import { BaseModal } from "./BaseModal";\nimport { useSettingsStore } from "@/store/settings";'
  );
}

// Inside component
code = code.replace(
  'export function PointsModal({ isOpen, onClose }: PointsModalProps) {',
  `export function PointsModal({ isOpen, onClose }: PointsModalProps) {\n  const { settings } = useSettingsStore();`
);

// Fallback pricingTiers
const hardcodedTiers = `[
  { id: 'tier-1', points: 1000, price: 10 },
  { id: 'tier-2', points: 2000, price: 20 },
  { id: 'tier-3', points: 5000, price: 50 },
  { id: 'tier-4', points: 10000, price: 100 },
  { id: 'tier-5', points: 20000, price: 200 },
  { id: 'tier-6', points: 50000, price: 500 },
]`;

code = code.replace(
  `const pricingTiers: PricingTier[] = [
  { id: 'tier-1', points: 1000, price: 10 },
  { id: 'tier-2', points: 2000, price: 20 },
  { id: 'tier-3', points: 5000, price: 50 },
  { id: 'tier-4', points: 10000, price: 100 },
  { id: 'tier-5', points: 20000, price: 200 },
  { id: 'tier-6', points: 50000, price: 500 },
];`,
  ``
);

code = code.replace(
  `  const [selectedIndex, setSelectedIndex] = useState(0);`,
  `  const pricingTiers: PricingTier[] = settings?.points_topup_packages && settings.points_topup_packages.length > 0 ? settings.points_topup_packages : ${hardcodedTiers};\n  const [selectedIndex, setSelectedIndex] = useState(0);`
);

fs.writeFileSync('src/components/PointsModal.tsx', code);
