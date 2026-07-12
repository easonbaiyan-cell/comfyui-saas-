"use client";

import { useEffect, useState } from "react";

export function PromoBanner({ text, countdownUntil }: { text?: string, countdownUntil?: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!countdownUntil) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(countdownUntil).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownUntil]);

  if (!text) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
      {text}
      {countdownUntil && (
        <span className="ml-4 font-bold tabular-nums tracking-wider">{timeLeft}</span>
      )}
    </div>
  );
}
