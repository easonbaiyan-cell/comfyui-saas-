'use client';

import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface PricingTier {
  id: string;
  points: number;
  price: number;
}

const pricingTiers: PricingTier[] = [
  { id: 'tier-1', points: 1000, price: 10 },
  { id: 'tier-2', points: 2000, price: 20 },
  { id: 'tier-3', points: 5000, price: 50 },
  { id: 'tier-4', points: 10000, price: 100 },
  { id: 'tier-5', points: 20000, price: 200 },
  { id: 'tier-6', points: 50000, price: 500 },
];

export default function PointsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedTier = pricingTiers[selectedIndex];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-40 px-4 flex flex-col items-center">
      {/* 页面主体 */}
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">积分充值</h1>

        {/* 套餐网格区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {pricingTiers.map((tier, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedIndex(index)}
                className={`
                  cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden
                  flex flex-col bg-[#111]
                  ${
                    isSelected
                      ? 'border-lime-300 shadow-[0_0_15px_rgba(212,255,63,0.1)] bg-lime-300/5'
                      : 'border-white/10 hover:border-white/20 hover:bg-[#1a1a1a]'
                  }
                `}
              >
                {/* 卡片上半部分 */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-lime-300/20 text-lime-300' : 'bg-white/5 text-white/70'}`}>
                      <Zap size={24} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? "fill-lime-300/20" : ""} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">
                    {tier.points.toLocaleString()} <span className="text-sm text-gray-400 font-normal tracking-normal ml-1">积分</span>
                  </div>
                </div>

                {/* 分割线 */}
                <div className="w-full h-[1px] bg-white/5"></div>

                {/* 卡片下半部分 */}
                <div className="p-4 bg-black/20 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">价格</span>
                  <span className="text-xl font-medium">
                    <span className="text-sm mr-1">¥</span>{tier.price.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="text-gray-500 text-sm text-center sm:text-left leading-relaxed">
          温馨提示：积分和钱包不可转赠与提现，购买后有效期为1年，不支持退换，也不能反向兑换成现金。
        </div>
      </div>

      {/* 悬浮结算栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 sm:pb-8 flex justify-center pointer-events-none z-50">
        <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 flex items-center justify-end pointer-events-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-gray-400">实付款：</span>
              <span className="text-3xl font-bold text-lime-300">
                <span className="text-xl mr-1">¥</span>{selectedTier.price.toFixed(2)}
              </span>
            </div>
            <button className="bg-lime-300 hover:bg-lime-400 text-black px-10 py-3 rounded-xl font-bold text-lg transition-colors shadow-[0_0_15px_rgba(212,255,63,0.3)]">
              购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
