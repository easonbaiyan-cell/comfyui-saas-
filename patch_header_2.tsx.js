const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// 1. Add PointsModal import
code = code.replace('import PricingModal from "./PricingModal";', 'import PricingModal from "./PricingModal";\nimport { PointsModal } from "./PointsModal";');

// 2. Add isPointsOpen state
code = code.replace('const [isPricingOpen, setIsPricingOpen] = useState(false);', 'const [isPricingOpen, setIsPricingOpen] = useState(false);\n  const [isPointsOpen, setIsPointsOpen] = useState(false);');

// 3. Render PointsModal
const authModalRef = `{/* Global Auth Modal */}`;
const pointsModalRender = `{/* 新增：Points Modal (积分充值弹窗) */}\n      <PointsModal isOpen={isPointsOpen} onClose={() => setIsPointsOpen(false)} />\n\n      {/* Global Auth Modal */}`;
code = code.replace(authModalRef, pointsModalRender);

// 4. Change 充值 Link to Button
const rechargeLink = `<Link
                            href="/points"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="bg-[#2a2a2a] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors"
                          >
                            充值
                          </Link>`;
const rechargeButton = `<button
                            onClick={() => {
                              setIsPointsOpen(true);
                              setIsProfileDropdownOpen(false);
                            }}
                            className="bg-[#2a2a2a] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors"
                          >
                            充值
                          </button>`;
code = code.replace(rechargeLink, rechargeButton);

fs.writeFileSync('src/components/Header.tsx', code);
