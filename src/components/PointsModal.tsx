"use client";

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { useSettingsStore } from '@/store/settings';

interface PricingTier {
  id: string;
  points: number;
  price: number;
}



interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PointsModal({ isOpen, onClose }: PointsModalProps) {
  const { settings } = useSettingsStore();
  const pricingTiers: PricingTier[] = settings?.points_topup_packages && settings.points_topup_packages.length > 0 ? settings.points_topup_packages : [
  { id: 'tier-1', points: 1000, price: 10 },
  { id: 'tier-2', points: 2000, price: 20 },
  { id: 'tier-3', points: 5000, price: 50 },
  { id: 'tier-4', points: 10000, price: 100 },
  { id: 'tier-5', points: 20000, price: 200 },
  { id: 'tier-6', points: 50000, price: 500 },
];
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen) return null;

  const selectedTier = pricingTiers[selectedIndex];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-auto p-8 font-sans">
      <div className="flex flex-col text-white">
        <h1 className="text-2xl font-bold mb-6">积分充值</h1>

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
                      ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-primary-green/5'
                      : 'border-white/10 hover:border-white/20 hover:bg-[#1a1a1a]'
                  }
                `}
              >
                {/* 卡片上半部分 */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-primary-green/20 text-primary-green' : 'bg-white/5 text-black/70'}`}>
                      <Zap size={24} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? "fill-primary-green/20" : ""} />
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
        <div className="text-gray-500 text-sm mb-6 leading-relaxed">
          温馨提示：积分和钱包不可转赠与提现，购买后有效期为1年，不支持退换，也不能反向兑换成现金。
        </div>

        {/* 结算栏 */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center justify-end w-full">
          <div className="flex items-center space-x-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-gray-400">实付款：</span>
              <span className="text-3xl font-bold text-primary-green">
                <span className="text-xl mr-1">¥</span>{selectedTier.price.toFixed(2)}
              </span>
            </div>
            <button className="bg-primary-green hover:bg-primary-green text-black px-10 py-3 rounded-xl font-bold text-lg transition-colors shadow-[0_0_15px_var(--color-primary-green)]">
              购买
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
