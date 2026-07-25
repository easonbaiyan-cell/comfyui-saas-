"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "高额佣金排行榜",
    subtitle: "上月最高达人收益 ¥128,500",
    description: "立即加入我们的分销网络，享受全网最高额度返佣，快速实现变现。",
    icon: Trophy,
    accentColor: "from-[#D0FF2A] to-green-500",
    textColor: "text-[#D0FF2A]",
  },
  {
    id: 2,
    title: "最新爆款服饰生成",
    subtitle: "1000+ 商家首选工具",
    description: "一键生成小红书/抖音爆款带货视频，转化率提升300%。",
    icon: TrendingUp,
    accentColor: "from-purple-500 to-fuchsia-400",
    textColor: "text-purple-400",
  },
  {
    id: 3,
    title: "平台成功案例",
    subtitle: "助力新手卖家单月 GMV 突破 50 万",
    description: "零基础实操，智能 AI 引擎一站式解决您的所有电商素材需求。",
    icon: Sparkles,
    accentColor: "from-[#D0FF2A] to-purple-500",
    textColor: "text-white",
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black py-8">
      <div className="container mx-auto px-4 relative">
        <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden bg-[#1C1C1E] border border-gray-800 shadow-2xl">

          {/* Slides */}
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide) => {
              const Icon = slide.icon;
              return (
                <div key={slide.id} className="min-w-full h-full flex flex-col items-center justify-center p-8 md:p-20 text-center relative overflow-hidden group">
                  {/* Background Accents */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-gradient-to-b ${slide.accentColor} opacity-5 blur-[100px] rounded-full pointer-events-none`} />

                  <div className="relative z-10 flex flex-col items-center max-w-3xl">
                    <div className={`p-4 rounded-2xl bg-black/50 border border-gray-800 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-12 h-12 md:w-16 md:h-16 ${slide.textColor}`} />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                      {slide.title}
                    </h2>

                    <p className={`text-xl md:text-2xl font-medium mb-6 ${slide.textColor}`}>
                      {slide.subtitle}
                    </p>

                    <p className="text-gray-400 text-base md:text-lg max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="mt-10">
                       <button className="bg-[#D0FF2A] text-black hover:bg-[#bceb24] font-medium rounded-lg px-8 py-3 text-lg transition-colors shadow-[0_0_20px_rgba(208,255,42,0.3)]">
                         立即体验
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-[#D0FF2A] hover:text-black transition-colors border border-gray-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-[#D0FF2A] hover:text-black transition-colors border border-gray-700"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full h-2 ${
                  idx === currentIndex
                    ? "w-8 bg-[#D0FF2A]"
                    : "w-2 bg-gray-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
