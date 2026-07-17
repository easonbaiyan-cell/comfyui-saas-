const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// 1. Add \`unreadMessages\` state
const stateDec = `const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);`;
const stateDecNew = `const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);\n  const [unreadMessages, setUnreadMessages] = useState(true);`;
code = code.replace(stateDec, stateDecNew);

// 2. Clear unread messages and open drawer on Bell click
const bellClick = `onClick={() => setIsMessageOpen(true)}`;
const bellClickNew = `onClick={() => { setIsMessageOpen(true); setUnreadMessages(false); }}`;
code = code.replace(bellClick, bellClickNew);

// 3. Conditional red dot
const redDot = `<span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-primary-green ring-2 ring-[#1a1a1a]"></span>`;
const redDotNew = `{unreadMessages && <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-primary-green ring-2 ring-[#1a1a1a]"></span>}`;
code = code.replace(redDot, redDotNew);

// 4. Message truncate toggle component
const mockMessageComponent = `
function MockMessage({ title, date, content, isGreen }: { title: string, date: string, content: string, isGreen: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="bg-[#1a1a1a] rounded-lg p-3 mb-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={\`h-2 w-2 rounded-full \${isGreen ? 'bg-primary-green' : 'bg-gray-500'}\`}></span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className={\`text-xs text-gray-400 mb-2 \${expanded ? '' : 'truncate'}\`}>{content}</p>
      <div className="text-[10px] text-gray-500">{date}</div>
    </div>
  );
}
`;

const imports = `import type { User } from "@supabase/supabase-js";`;
code = code.replace(imports, imports + '\n' + mockMessageComponent);

// 5. Replace the mock messages in the render method with the new component
const oldMessagesBlock = `{/* Mock Message 1 */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-primary-green"></span>
                <h3 className="text-sm font-semibold text-white">全新「控制台」上线</h3>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">原消费记录已全面升级，提供更清晰的账单明细和使用分析。</p>
              <div className="text-[10px] text-gray-500">2026-05-15</div>
            </div>

            {/* Mock Message 2 */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-primary-green"></span>
                <h3 className="text-sm font-semibold text-white">充值优惠活动</h3>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">本月充值积分享受额外20%赠送，多充多送，活动限时进行中。</p>
              <div className="text-[10px] text-gray-500">2026-05-12</div>
            </div>

            {/* Mock Message 3 */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                <h3 className="text-sm font-semibold text-white">系统维护通知</h3>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">预计于周日凌晨2点进行系统升级，期间可能出现短暂的访问波动。</p>
              <div className="text-[10px] text-gray-500">2026-05-01</div>
            </div>`;

const newMessagesBlock = `
            <MockMessage title="全新「控制台」上线" date="2026-05-15" content="原消费记录已全面升级，提供更清晰的账单明细和使用分析。" isGreen={true} />
            <MockMessage title="充值优惠活动" date="2026-05-12" content="本月充值积分享受额外20%赠送，多充多送，活动限时进行中。" isGreen={true} />
            <MockMessage title="系统维护通知" date="2026-05-01" content="预计于周日凌晨2点进行系统升级，期间可能出现短暂的访问波动。" isGreen={false} />
`;

code = code.replace(oldMessagesBlock, newMessagesBlock);

fs.writeFileSync('src/components/Header.tsx', code);
