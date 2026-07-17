const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// 1. import useAuthStore
code = code.replace('import type { User } from "@supabase/supabase-js";', 'import type { User } from "@supabase/supabase-js";\nimport { useAuthStore } from "@/store/auth";');

// 2. Use the hook inside Header component
const headerComponentStart = `export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {`;
const headerComponentStartNew = `export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {
  const points = useAuthStore(state => state.积分余额);`;
code = code.replace(headerComponentStart, headerComponentStartNew);

// 3. Replace points references
const ref1 = `<span className="text-sm font-bold text-white">6,525</span>`;
const ref1New = `<span className="text-sm font-bold text-white">{points.toLocaleString()}</span>`;
code = code.replace(ref1, ref1New);

const ref2 = `<span className="text-primary-green font-bold text-lg font-mono tracking-tight">56,435</span>`;
const ref2New = `<span className="text-primary-green font-bold text-lg font-mono tracking-tight">{points.toLocaleString()}</span>`;
code = code.replace(ref2, ref2New);

// 4. Update upgrading routing from /pricing to a modal open function
const upgradeLink = `<Link
                          href="/pricing"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                        >
                          升级
                        </Link>`;
const upgradeButton = `<button
                          onClick={() => {
                            setIsPricingOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                        >
                          升级
                        </button>`;
code = code.replace(upgradeLink, upgradeButton);

fs.writeFileSync('src/components/Header.tsx', code);
