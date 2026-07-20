const fs = require('fs');
let code = fs.readFileSync('src/components/PromoBanner.tsx', 'utf8');

// 1. Add import for store
if (!code.includes('useSettingsStore')) {
  code = code.replace('import { X } from "lucide-react";', 'import { X } from "lucide-react";\nimport { useSettingsStore } from "@/store/settings";');
}

// 2. Change logic inside component
code = code.replace(
  `export function PromoBanner({ text, countdownUntil }: { text?: string, countdownUntil?: Date }) {`,
  `export function PromoBanner({ text: propText, countdownUntil: propCountdown }: { text?: string, countdownUntil?: Date }) {
  const { settings } = useSettingsStore();
  const text = settings?.banner_text || propText;
  const countdownEndStr = settings?.banner_countdown_end;
  const countdownUntil = countdownEndStr ? new Date(countdownEndStr) : propCountdown;
  const highlightTag = settings?.banner_highlight_tag || "首发特惠";
  const discountText = settings?.banner_discount_text || "5 折";
  const enabled = settings ? settings.banner_enabled : true;`
);

// 3. Update visibility check
code = code.replace(
  `  if (!text || !isVisible) return null;`,
  `  if (!text || !isVisible || !enabled) return null;`
);

// 4. Update keywords in highlight function
code = code.replace(
  `const keywords = ["限时 37 折", "0.37元/秒", "37 折", "首发特惠", "5 折"];`,
  `const keywords = ["限时 37 折", "0.37元/秒", "37 折", "首发特惠", "5 折", highlightTag, discountText].filter(Boolean);`
);

fs.writeFileSync('src/components/PromoBanner.tsx', code);
