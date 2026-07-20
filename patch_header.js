const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// The file already imports useSettingsStore? Let's check
if (!code.includes('useSettingsStore')) {
  // It shouldn't yet
  code = code.replace(
    'import { useAuthStore } from "@/store/auth";',
    'import { useAuthStore } from "@/store/auth";\nimport { useSettingsStore } from "@/store/settings";'
  );
} else if (!code.includes('import { useSettingsStore } from "@/store/settings";')) {
  code = code.replace(
    'import { useAuthStore } from "@/store/auth";',
    'import { useAuthStore } from "@/store/auth";\nimport { useSettingsStore } from "@/store/settings";'
  );
}

// Hook it up inside Header
code = code.replace(
  'export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {',
  'export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {\n  const { settings } = useSettingsStore();'
);

// Replace popover text
// 扫码添加专属客服
// 二维码占位

code = code.replace(
  '<div className="w-32 h-32 bg-white rounded-md mx-auto mt-2 flex items-center justify-center text-black/50 text-xs">\n                    二维码占位\n                  </div>',
  `{settings?.cs_qrcode_url ? (
                    <img src={settings.cs_qrcode_url} alt="QR Code" className="w-32 h-32 rounded-md mx-auto mt-2 object-cover" />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-md mx-auto mt-2 flex items-center justify-center text-black/50 text-xs">
                      二维码占位
                    </div>
                  )}
                  {settings?.cs_wechat_id && (
                    <div className="mt-2 text-center text-xs text-white">
                      微信: {settings.cs_wechat_id}
                    </div>
                  )}`
);

fs.writeFileSync('src/components/Header.tsx', code);
