"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const backgroundImages = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=3000&auto=format&fit=crop",
];

export function HeroCarousel({ bannerSettings }: { bannerSettings?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = bannerSettings?.main_banner_bg_image
    ? [bannerSettings.main_banner_bg_image]
    : backgroundImages;


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full min-h-[80vh] overflow-hidden bg-black group">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-[position:right_center]"
              style={{ backgroundImage: `url('${img}')` }}
            />
          </div>
        ))}
      </div>

      {/* Gradient Mask */}
      <div className="absolute inset-y-0 left-0 z-10 w-full md:w-[55%] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 h-full w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center">
        <div className="w-full md:w-[55%] flex flex-col justify-center h-full pt-10">

          {/* Top Label */}
          <div className="mb-6">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#D0FF2A] uppercase">
              {bannerSettings?.main_banner_top_tag || 'PAPAGAGA 商业级应用'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            {bannerSettings?.main_banner_title_1 || '1人超级AI公司'}
          </h1>

          {/* Sub Title */}
          <h2 className="text-4xl md:text-6xl text-[#D0FF2A] font-black mb-6">
            {bannerSettings?.main_banner_title_2 || '小白轻松掌控带货全闭环'}
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-12 max-w-xl">
            {bannerSettings?.main_banner_description || '颠覆传统电商模式，以极低门槛重塑内容生产力。从零基础到爆款视频，用 AI 构建属于超级个体的自动化印钞机。'}
          </p>

          {/* Data Stats Cards */}
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col border border-white/5 bg-transparent p-4 rounded-xl min-w-[120px]">
              <span className="text-4xl font-bold text-white mb-2">{bannerSettings?.main_banner_metric_1_value || "30"}</span>
              <span className="text-[10px] text-gray-500 tracking-widest">{bannerSettings?.main_banner_metric_1_label || "节实战课程"}</span>
            </div>
            <div className="flex flex-col border border-white/5 bg-transparent p-4 rounded-xl min-w-[120px]">
              <span className="text-4xl font-bold text-white mb-2">{bannerSettings?.main_banner_metric_2_value || "4步"}</span>
              <span className="text-[10px] text-gray-500 tracking-widest">{bannerSettings?.main_banner_metric_2_label || "极简工作流"}</span>
            </div>
            <div className="flex flex-col border border-white/5 bg-transparent p-4 rounded-xl min-w-[120px]">
              <span className="text-4xl font-bold text-white mb-2">{bannerSettings?.main_banner_metric_3_value || "25%"}</span>
              <span className="text-[10px] text-gray-500 tracking-widest">{bannerSettings?.main_banner_metric_3_label || "最高分销佣金"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white border border-gray-700/50 hover:border-[#D0FF2A] hover:text-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.5)] transition-all opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white border border-gray-700/50 hover:border-[#D0FF2A] hover:text-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.5)] transition-all opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full h-2 ${
              idx === currentIndex
                ? "w-4 h-1.5 bg-[#D0FF2A]"
                : "w-1.5 h-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
