
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSettingsStore } from "@/store/settings";

export function PromoBanner({ text: propText, countdownUntil: propCountdown }: { text?: string, countdownUntil?: Date }) {
  const { settings } = useSettingsStore();
  const text = settings?.banner_text || propText;
  const countdownEndStr = settings?.banner_countdown_end;
  const countdownUntil = countdownEndStr ? new Date(countdownEndStr) : propCountdown;
  const highlightTag = settings?.banner_highlight_tag;
  const discountText = settings?.banner_discount_text;
  const enabled = settings ? settings.banner_enabled : true;
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!countdownUntil) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(countdownUntil).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}天 ${hours}时 ${minutes}分 ${seconds}秒`);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownUntil]);

  if (!text || !isVisible || !enabled) return null;

  return (
    <div className="w-full bg-[#B200FF] px-4 py-2 flex items-center justify-center text-sm text-white relative">
      <div className="flex items-center flex-wrap justify-center gap-2">
        {/* 主文案 */}
        {text && <span>{text}</span>}

        {/* 高亮标签 (荧光黄底黑字) */}
        {highlightTag && (
          <span className="bg-[#D4FF00] text-black px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
            {highlightTag}
          </span>
        )}

        {/* 优惠文案 (荧光黄底黑字) */}
        {discountText && (
          <span className="bg-[#D4FF00] text-black px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
            {discountText}
          </span>
        )}

        {/* 分隔符与倒计时 */}
        {countdownUntil && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/40">
            {isClient ? (
               /* 倒计时的深色半透明背景 */
               <span className="bg-black/20 px-2 py-1 rounded font-mono tracking-wider">
                 {timeLeft}
               </span>
            ) : (
               <span className="bg-black/20 px-2 py-1 rounded opacity-0 inline-block w-20">
                 00:00:00
               </span>
            )}
          </div>
        )}
      </div>

      {/* 关闭按钮 */}
      <button onClick={() => setIsVisible(false)} className="absolute right-4 hover:opacity-75">
        <X size={16} />
      </button>
    </div>
  );
}
