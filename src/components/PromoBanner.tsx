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

  useEffect(() => {
    if (!countdownUntil) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(countdownUntil).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("已结束");
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

  // Function to highlight promotional keywords
  const highlightKeywords = (originalText: string) => {
    const keywords = ["限时 37 折", "0.37元/秒", "37 折", "首发特惠", "5 折", highlightTag, discountText].filter(Boolean);
    
    let parts: (string | React.ReactNode)[] = [originalText];
    keywords.forEach(kw => {
      parts = parts.flatMap(part => {
        if (typeof part !== 'string') return [part];
        const split = part.split(kw);
        return split.reduce((acc: (string | React.ReactNode)[], current, idx) => {
          if (idx === 0) return [current];
          return [...acc, <span key={`${kw}-${idx}`} className="bg-primary-green text-black px-2 py-0.5 rounded-md mx-1 font-bold">{kw}</span>, current];
        }, []);
      });
    });
    
    return parts;
  };

  return (
    <div className="relative bg-fuchsia-600 text-white py-2 px-10 text-center text-sm font-medium flex items-center justify-center min-h-[40px]">
      <div className="flex-1 flex items-center justify-center flex-wrap gap-2">
        {highlightTag && (
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-xs font-bold mr-1">{highlightTag}</span>
        )}
        <span>{highlightKeywords(text)}</span>
        {discountText && (
          <span>- {discountText}</span>
        )}
        {countdownUntil && (
          <>
            <span className="mx-2">|</span>
            <span className="font-bold tabular-nums tracking-wider bg-black/20 px-2 py-0.5 rounded-md text-white">{timeLeft}</span>
          </>
        )}
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:bg-black/20 rounded-full transition-colors flex-shrink-0 text-white"
        aria-label="Close banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}
