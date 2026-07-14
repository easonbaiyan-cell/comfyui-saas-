import React, { useState } from 'react';
import { X } from 'lucide-react';

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || "w-4 h-4"}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function PricingModal({ onClose }: { onClose?: () => void }) {
  // Mock current subscription logic
  // 0 = 未登录/未订阅, 1 = 基础包月, 2 = 连续包月, 3 = 连续包年
  const currentPlan = 0;
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const plans = [
    { id: 1, title: '基础包月', price: 1280, originalPrice: 1680, perMonth: true },
    { id: 2, title: '连续包月', price: 680, originalPrice: 1680, perMonth: true },
    { id: 3, title: '连续包年', price: 6800, originalPrice: 20160, perMonth: false }
  ];

  const getButtonState = (planId: number, price: number) => {
    if (currentPlan === 0) return { text: '未订阅', disabled: false, highlight: true };
    if (currentPlan === planId) return { text: '当前订阅中', disabled: true, highlight: false };
    if (currentPlan > planId) return { text: '当前订阅高于此档', disabled: true, highlight: false };

    // Upgrade case
    const currentPlanPrice = plans.find(p => p.id === currentPlan)?.price || 0;
    const diff = price - currentPlanPrice;
    return { text: `仅需 ￥${diff} 即可升级`, disabled: false, highlight: true };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-auto bg-[#0b0d13] rounded-2xl p-8 border border-white/10 shadow-2xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        )}
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">会员超市</h2>
      </div>

      {/* 3 Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* Card 1: 基础包月 */}
        <div
          onClick={() => setSelectedPlan(1)}
          className={`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
            ${selectedPlan === 1
              ? 'border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.3)] scale-[1.02] bg-gradient-to-b from-gray-800/80 to-black'
              : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
          `}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold text-white shadow-lg">
            限时 7.5 折
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
            disabled={getButtonState(1, 1280).disabled}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              ${getButtonState(1, 1280).disabled
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'}`}
          >
            {getButtonState(1, 1280).text}
          </button>
          
          <hr className="border-gray-800 mb-6" />
          
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-gray-500 w-5 h-5" />
              不含水印
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-gray-500 w-5 h-5" />
              单任务时长 20 分钟
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-gray-500 w-5 h-5" />
              无插队权益
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-gray-500 w-5 h-5" />
              并发数 2
            </li>
          </ul>
        </div>

        {/* Card 2: 连续包月 (Main highlight) */}
        <div
          onClick={() => setSelectedPlan(2)}
          className={`relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer p-6 transform md:-translate-y-4
            ${selectedPlan === 2
              ? 'border-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.5)] scale-[1.05] bg-gradient-to-b from-indigo-900/60 to-black'
              : 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/40 to-black shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] hover:border-indigo-400/80'}
          `}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold text-white shadow-lg">
            限时 4 折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-indigo-300">连续包月</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">¥680</span>
            <span className="text-sm text-gray-500 line-through">¥1680</span>
            <span className="text-sm text-gray-400">/月</span>
          </div>
          <p className="text-sm text-indigo-300/70 mb-4">次月续费 ¥680（可随时取消）</p>
          <p className="text-sm text-gray-400 mb-6">1积分=0.0095元</p>
          
          <div className="mt-auto mb-4 text-center">
            <div className="inline-block px-4 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold mb-1">
              72000 积分/月
            </div>
            <p className="text-xs text-gray-400 mt-1">每月生成约180个视频，每个视频约3.5元</p>
          </div>
          
          <button
            disabled={getButtonState(2, 680).disabled}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              ${getButtonState(2, 680).disabled
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}
          >
            {getButtonState(2, 680).text}
          </button>
          
          <hr className="border-gray-800 mb-6" />
          
          <ul className="space-y-4 text-sm text-gray-200">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-indigo-400 w-5 h-5" />
              不含水印
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-indigo-400 w-5 h-5" />
              单任务时长 60 分钟
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-indigo-400 w-5 h-5" />
              享受插队权益
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-indigo-400 w-5 h-5" />
              并发数 5
            </li>
          </ul>
        </div>

        {/* Card 3: 连续包年 (Gold highlight) */}
        <div
          onClick={() => setSelectedPlan(3)}
          className={`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6
            ${selectedPlan === 3
              ? 'border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.3)] scale-[1.02] bg-gradient-to-b from-yellow-900/40 to-black'
              : 'border-yellow-700/50 bg-gradient-to-b from-yellow-950/30 to-black hover:border-yellow-600/70'}
          `}
        >
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full text-xs font-bold text-yellow-950 shadow-lg">
            限时 3 折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-yellow-500/90">连续包年</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">¥6800</span>
            <span className="text-sm text-gray-500 line-through">¥20160</span>
            <span className="text-sm text-gray-400">/年</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">无自动续费</p>
          <p className="text-sm text-gray-400 mb-6">1积分=0.0078元</p>
          
          <div className="mt-auto mb-4 text-center">
            <div className="inline-block px-4 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold mb-1">
              72000 积分/月
            </div>
            <p className="text-xs text-gray-500 mt-1">每月生成约180个视频，每个视频约3元</p>
          </div>
          
          <button
            disabled={getButtonState(3, 6800).disabled}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
              ${getButtonState(3, 6800).disabled
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-yellow-700/80 to-yellow-600/80 border border-yellow-500/50 hover:from-yellow-600 hover:to-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]'}`}
          >
            {getButtonState(3, 6800).text}
          </button>
          
          <hr className="border-gray-800 mb-6" />
          
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <CheckIcon className="text-yellow-600 w-5 h-5" />
              不含水印
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-yellow-600 w-5 h-5" />
              单任务时长 60 分钟
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-yellow-600 w-5 h-5" />
              享受插队权益
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="text-yellow-600 w-5 h-5" />
              并发数 5
            </li>
          </ul>
        </div>
        
      </div>

      {/* Footer Info */}
      <div className="w-full mt-10 text-left text-xs text-gray-500 leading-relaxed border-t border-white/10 pt-4">
        <p className="flex items-start gap-1">
          <span className="text-sm mt-[-1px]">✨</span>
          <span>积分使用说明：免费用户登录每日赠送 20 积分，每日赠送 2 次 5 折生成特权；云端存储空间保留 30 天；订阅积分每 31 天进行重置，过期作废。本平台实行单一积分制。</span>
        </p>
      </div>
      
      </div>
    </div>
  );
}