
"use client";

import { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { useSettingsStore } from "@/store/settings";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CountdownText({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span>剩余 {timeLeft}</span>;
}

interface PricingModalProps {
  onClose?: () => void;
  currentPlan?: number; 
}

export default function PricingModal({ onClose, currentPlan = 0 }: PricingModalProps) {
  const { settings } = useSettingsStore();

  const plans = settings?.membership_packages || [];

  // Set default selected to middle plan or first
  const [selectedPlan, setSelectedPlan] = useState<number>(plans.length > 1 ? 1 : 0);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);

  const handlePurchase = (e: React.MouseEvent, planIndex: number) => {
    e.stopPropagation();
    setPurchaseLoading(planIndex);
    setTimeout(() => {
      setPurchaseLoading(null);
      alert("处理中...");
    }, 800);
  };

  const getButtonState = (planIndex: number, price: number) => {
    if (currentPlan === 0) {
      return { text: "立即开通", disabled: false, highlight: true };
    }
    
    const mappedId = planIndex + 1;
    if (currentPlan === mappedId) {
      return { text: "当前套餐", disabled: true, highlight: false };
    }

    const currentPlanObj = plans[currentPlan - 1];
    const currentPlanPrice = currentPlanObj?.current_price ?? 0;

    if (price < currentPlanPrice) {
      return { text: "不支持降级", disabled: true, highlight: false };
    }

    const diff = price - currentPlanPrice;
    return { text: `仅需 ￥${diff} 即可升级`, disabled: false, highlight: true };
  };

  return (
    <BaseModal isOpen={true} onClose={() => {
        if (onClose) onClose();
      }} className="max-w-6xl w-full mx-auto max-h-[90vh] overflow-y-auto p-8 font-sans">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">会员超市</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {plans.map((pkg, index) => {
          const isSelected = selectedPlan === index;
          
          const discount = (pkg.original_price ?? 0) > 0 ? ((pkg.current_price ?? 0) / (pkg.original_price ?? 1)) * 10 : 10;
          const discountText = Math.round(discount * 10) % 10 === 0 ? Math.round(discount) : discount.toFixed(1);

          return (
            <div
              key={index}
              onClick={() => setSelectedPlan(index)}
              className={`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer p-6 backdrop-blur-sm
                ${isSelected
                  ? 'border-primary-green shadow-[0_0_15px_var(--color-primary-green)] bg-gradient-to-b from-gray-800/80 to-black'
                  : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black hover:border-gray-700'}
              `}
            >
              {pkg.enable_countdown && pkg.countdown_deadline ? (
                <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 bg-gradient-to-r from-orange-400 to-cyan-300 rounded-t-full rounded-br-full rounded-bl-none text-xs font-medium text-black shadow-lg flex items-center justify-center">
                  限时 {discountText}折<span className="text-[10px] ml-1 opacity-80 font-normal"><CountdownText deadline={pkg.countdown_deadline} /></span>
                </div>
              ) : discount < 10 ? (
                <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full text-xs font-bold text-white shadow-lg">
                  {discountText}折
                </div>
              ) : null}

              <div className="mb-4">
                <h3 className={`text-xl font-semibold ${isSelected ? 'text-primary-green' : 'text-gray-200'}`}>{pkg.name}</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">¥{pkg.current_price}</span>
                {(pkg.original_price ?? 0) > (pkg.current_price ?? 0) && (
                  <div className="flex flex-col ml-2 justify-center leading-tight">
                    <span className="text-gray-600 line-through text-[10px]">原价 ¥{pkg.original_price}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-6 flex-grow"></p>

              <div className="mt-auto mb-4 text-center">
                <div className={`inline-block px-4 py-1.5 rounded-lg ${isSelected ? 'bg-primary-green/20 border border-primary-green/30 text-primary-green' : 'text-gray-200'} font-bold mb-1`}>
                  {pkg.points_per_month} 积分/月
                </div>
              </div>

              <button
                disabled={getButtonState(index, pkg.current_price ?? 0).disabled || purchaseLoading === index}
                onClick={(e) => handlePurchase(e, index)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors mb-6
                  ${getButtonState(index, pkg.current_price ?? 0).disabled
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : isSelected
                      ? 'bg-primary-green hover:bg-primary-green/90 text-black shadow-[0_0_15px_var(--color-primary-green)]'
                      : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'}`}
              >
                {purchaseLoading === index ? "处理中..." : getButtonState(index, pkg.current_price ?? 0).text}
              </button>

              <hr className="border-gray-800 mb-6" />

              <ul className="space-y-4 text-sm text-gray-300">
                {pkg.features && pkg.features.map((feature: string, fIndex: number) => (
                  <li key={fIndex} className="flex items-center gap-3">
                    <CheckIcon className={`${isSelected ? 'text-primary-green' : 'text-gray-500'} w-5 h-5`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="w-full mt-10 text-left text-xs text-gray-500 leading-relaxed border-t border-white/10 pt-4">
        <p className="flex items-start gap-1">
          <span className="text-sm mt-[-1px]">✨</span>
          <span>积分使用说明：免费用户登录每日赠送 20 积分，每日赠送 2 次 5 折生成特权；云端存储空间保留 30 天；订阅积分每 31 天进行重置，过期作废。本平台实行单一积分制。</span>
        </p>
      </div>
      
    </BaseModal>
  );
}
