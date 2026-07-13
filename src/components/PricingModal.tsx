import React from 'react';
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

interface PricingModalProps {
  onClose?: () => void;
  defaultPlan?: string;
}

export default function PricingModal({ onClose }: PricingModalProps) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-[#0b0d13] bg-opacity-95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white font-sans overflow-y-auto">
      
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* 3 Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full my-auto">
        
        {/* Card 1: 基础包月 */}
        <div className="relative flex flex-col rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black p-6 backdrop-blur-sm">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold shadow-lg">
            限时 7.5 折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-200">基础包月</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold">¥1280</span>
            <span className="text-sm text-gray-500 line-through">¥1680</span>
            <span className="text-sm text-gray-400">/月</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">无自动续费</p>
          <p className="text-sm text-gray-400 mb-6">1积分=0.018元</p>
          
          <div className="mt-auto mb-4 text-center">
            <p className="text-lg font-bold text-gray-200">72000 积分/月</p>
            <p className="text-xs text-gray-500 mt-1">每月生成约180个视频，每个视频约7元</p>
          </div>
          
          <button disabled className="w-full py-3 px-4 rounded-xl bg-gray-800 text-gray-500 font-medium cursor-not-allowed mb-6">
            当前订阅高于此档
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
        <div className="relative flex flex-col rounded-2xl border-2 border-indigo-500/80 bg-gradient-to-b from-indigo-950/40 to-black p-6 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transform md:-translate-y-4">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold shadow-lg">
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
          
          <button className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors mb-6 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            当前订阅中
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
        <div className="relative flex flex-col rounded-2xl border border-yellow-700/50 bg-gradient-to-b from-yellow-950/30 to-black p-6">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full text-xs font-bold text-yellow-950 shadow-lg">
            限时 3 折
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-yellow-500/90">连续包年</h3>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold">¥6800</span>
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
          
          <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-700/20 to-yellow-600/20 border border-yellow-600/50 hover:bg-yellow-600/30 text-yellow-500 font-semibold transition-colors mb-6">
            仅需 ¥6120 即可升级
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
      <div className="max-w-6xl w-full mt-10 mb-4 text-left text-xs text-gray-500 leading-relaxed">
        <p className="flex items-start gap-1">
          <span className="text-sm mt-[-1px]">✨</span>
          <span>积分使用说明：免费用户登录每日赠送 20 积分，每日赠送 2 次 5 折生成特权；云端存储空间保留 30 天；订阅积分每 31 天进行重置，过期作废。本平台实行单一积分制。</span>
        </p>
      </div>
      
    </div>
  );
}
