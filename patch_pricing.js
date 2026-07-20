const fs = require('fs');
let code = fs.readFileSync('src/components/PricingModal.tsx', 'utf8');

if (!code.includes('useSettingsStore')) {
  code = code.replace(
    'import { BaseModal } from "./BaseModal";',
    'import { BaseModal } from "./BaseModal";\nimport { useSettingsStore } from "@/store/settings";'
  );
}

// Inside component
code = code.replace(
  'export default function PricingModal({ onClose, currentPlan = 0 }: PricingModalProps) {',
  `export default function PricingModal({ onClose, currentPlan = 0 }: PricingModalProps) {\n  const { settings } = useSettingsStore();`
);

// Fallback plans
const hardcodedPlans = `[
    { id: 1, price: 1280, original_price: 1680, title: "基础包月", points_per_month: 72000, features: ["无自动续费", "1积分=0.018元", "每月生成约180个视频", "每个视频约7元"] },
    { id: 2, price: 680, original_price: 1280, title: "连续包月", points_per_month: 72000, features: ["每月自动扣费，可随时取消", "1积分=0.009元", "每月生成约180个视频", "每个视频约3.7元"] },
    { id: 3, price: 6800, original_price: 15360, title: "连续包年", points_per_month: 72000, features: ["每年自动扣费，可随时取消", "1积分=0.007元", "相当于买10个月送2个月", "每月生成约180个视频"] },
  ]`;

code = code.replace(
  `  const plans = [
    { id: 1, price: 1280 },
    { id: 2, price: 680 },
    { id: 3, price: 6800 },
  ];`,
  `  const plans = settings?.membership_packages && settings.membership_packages.length > 0 ? settings.membership_packages : ${hardcodedPlans};`
);

// Map the cards
const searchCards = `{/* 3 Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

        {/* Card 1: 基础包月 */}
        <div
          onClick={() => setSelectedPlan(1)}
          className={\`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
            \${selectedPlan === 1
              ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-gradient-to-b from-gray-800/80 to-black'
              : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
          \`}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold text-white shadow-lg">
            7.5折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-200">基础包月</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">¥1280</span>
            <span className="text-sm text-gray-500 line-through">¥1680</span>
            <span className="text-sm text-gray-400">/月</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">无自动续费</p>
          <p className="text-sm text-gray-400 mb-6">1积分=0.018元</p>

          <div className="mt-auto mb-4 text-center">
            <p className="text-lg font-bold text-gray-200">72000 积分/月</p>
            <p className="text-xs text-gray-500 mt-1">每月生成约180个视频，每个视频约7元</p>
          </div>

          <button
            disabled={getButtonState(1, 1280).disabled || purchaseLoading === 1}
            onClick={(e) => handlePurchase(e, 1)}
            className={\`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              \${getButtonState(1, 1280).highlight
                ? 'bg-primary-green text-black hover:bg-[#bceb24]'
                : 'bg-gray-800 text-gray-300'}
              \${getButtonState(1, 1280).disabled ? 'opacity-50 cursor-not-allowed' : ''}
            \`}
          >
            {purchaseLoading === 1 ? '处理中...' : getButtonState(1, 1280).text}
          </button>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>每天赠送100算力，本月有效</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行平台所有免费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行VIP专属收费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>并发执行数量：1</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300 opacity-50">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>专属会员高速通道</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300 opacity-50">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>新上线模型内测与抢先体验</span>
            </li>
          </ul>
        </div>

        {/* Card 2: 连续包月 (Recommended) */}
        <div
          onClick={() => setSelectedPlan(2)}
          className={\`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
            \${selectedPlan === 2
              ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-gradient-to-b from-gray-800/80 to-black'
              : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
          \`}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-black shadow-lg">
            5.3折
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-green rounded-b-lg text-xs font-bold text-black">
            最多人选择
          </div>

          <div className="mb-4 mt-2">
            <h3 className="text-xl font-semibold text-gray-200">连续包月</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">¥680</span>
            <span className="text-sm text-gray-500 line-through">¥1280</span>
            <span className="text-sm text-gray-400">/月</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">每月自动扣费，可随时取消</p>
          <p className="text-sm text-gray-400 mb-6 text-primary-green/80 font-medium">1积分=0.009元</p>

          <div className="mt-auto mb-4 text-center">
            <p className="text-lg font-bold text-gray-200">72000 积分/月</p>
            <p className="text-xs text-gray-500 mt-1">每月生成约180个视频，每个视频约3.7元</p>
          </div>

          <button
            disabled={getButtonState(2, 680).disabled || purchaseLoading === 2}
            onClick={(e) => handlePurchase(e, 2)}
            className={\`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              \${getButtonState(2, 680).highlight
                ? 'bg-primary-green text-black hover:bg-[#bceb24]'
                : 'bg-gray-800 text-gray-300'}
              \${getButtonState(2, 680).disabled ? 'opacity-50 cursor-not-allowed' : ''}
            \`}
          >
            {purchaseLoading === 2 ? '处理中...' : getButtonState(2, 680).text}
          </button>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>每天赠送100算力，本月有效</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行平台所有免费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行VIP专属收费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>并发执行数量：1</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span className="text-primary-green">专属会员高速通道</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300 opacity-50">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>新上线模型内测与抢先体验</span>
            </li>
          </ul>
        </div>

        {/* Card 3: 连续包年 */}
        <div
          onClick={() => setSelectedPlan(3)}
          className={\`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
            \${selectedPlan === 3
              ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-gradient-to-b from-gray-800/80 to-black'
              : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
          \`}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold text-white shadow-lg">
            4.4折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-200">连续包年</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">¥6800</span>
            <span className="text-sm text-gray-500 line-through">¥15360</span>
            <span className="text-sm text-gray-400">/年</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">每年自动扣费，可随时取消</p>
          <p className="text-sm text-gray-400 mb-6 text-primary-green/80 font-medium">1积分=0.007元</p>

          <div className="mt-auto mb-4 text-center">
            <p className="text-lg font-bold text-gray-200">72000 积分/月</p>
            <p className="text-xs text-gray-500 mt-1">相当于买10个月送2个月，每月180个视频</p>
          </div>

          <button
            disabled={getButtonState(3, 6800).disabled || purchaseLoading === 3}
            onClick={(e) => handlePurchase(e, 3)}
            className={\`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              \${getButtonState(3, 6800).highlight
                ? 'bg-primary-green text-black hover:bg-[#bceb24]'
                : 'bg-gray-800 text-gray-300'}
              \${getButtonState(3, 6800).disabled ? 'opacity-50 cursor-not-allowed' : ''}
            \`}
          >
            {purchaseLoading === 3 ? '处理中...' : getButtonState(3, 6800).text}
          </button>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>每天赠送100算力，本月有效</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行平台所有免费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>可执行VIP专属收费模型</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span>并发执行数量：1</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span className="text-primary-green">专属会员高速通道</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-300">
              <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <span className="text-primary-green">新上线模型内测与抢先体验</span>
            </li>
          </ul>
        </div>
      </div>`;

const replaceCards = `{/* Dynamic Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {plans.map((plan: any) => {
          const isSelected = selectedPlan === plan.id;
          const discount = ((plan.price / plan.original_price) * 10).toFixed(1);

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={\`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
                \${isSelected
                  ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-gradient-to-b from-gray-800/80 to-black'
                  : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
              \`}
            >
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold text-white shadow-lg">
                {discount}折
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-200">{plan.title}</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">¥{plan.price}</span>
                <span className="text-sm text-gray-500 line-through">¥{plan.original_price}</span>
                <span className="text-sm text-gray-400">/{(plan.title || "").includes('年') ? '年' : '月'}</span>
              </div>

              <div className="mt-auto mb-4 text-center mt-6">
                <p className="text-lg font-bold text-gray-200">{plan.points_per_month} 积分/月</p>
              </div>

              <button
                disabled={getButtonState(plan.id, plan.price).disabled || purchaseLoading === plan.id}
                onClick={(e) => handlePurchase(e, plan.id)}
                className={\`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
                  \${getButtonState(plan.id, plan.price).highlight
                    ? 'bg-primary-green text-black hover:bg-[#bceb24]'
                    : 'bg-gray-800 text-gray-300'}
                  \${getButtonState(plan.id, plan.price).disabled ? 'opacity-50 cursor-not-allowed' : ''}
                \`}
              >
                {purchaseLoading === plan.id ? '处理中...' : getButtonState(plan.id, plan.price).text}
              </button>

              <ul className="space-y-4">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckIcon className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>`;

code = code.replace(searchCards, replaceCards);

fs.writeFileSync('src/components/PricingModal.tsx', code);
