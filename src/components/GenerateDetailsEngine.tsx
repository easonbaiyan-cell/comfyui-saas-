'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

export function GenerateDetailsEngine() {
  return (
    <div className="w-full bg-[#1C1C1E] rounded-3xl p-8 border-2 border-dashed border-[#D0FF2A]/30 hover:border-[#D0FF2A]/60 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Input & Action Area */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              一键生成详情页
            </h2>
            <p className="text-gray-400">轻松圈起流量</p>
          </div>

          {/* Parameters Configuration Area */}
          <div className="border border-gray-800 bg-black/50 rounded-2xl p-6 flex-1 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="text-gray-500 flex items-center justify-center bg-[#1C1C1E] rounded-xl h-32 border border-gray-800/50 hover:border-gray-600 transition-colors cursor-pointer border-dashed">
                <span>点击上传细节图</span>
              </div>
            ))}
          </div>

          {/* Generate Action Area */}
          <div className="flex flex-col items-center justify-center gap-4 mt-auto pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">预估单次积分消耗 ≈ 10 积分</span>
              <div className="relative group cursor-help ml-1">
                <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black border border-white/10 text-xs text-gray-300 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                  每次生成将固定扣除显示的积分数。
                </div>
              </div>
            </div>

            <button className="w-full text-black font-bold text-lg h-14 px-12 rounded-xl transition-all flex items-center justify-center bg-[#D0FF2A] hover:bg-[#bceb24] shadow-[0_0_15px_#D0FF2A] hover:shadow-[0_0_20px_#D0FF2A] hover:scale-[1.02] active:scale-[0.98]">
              立即生成
            </button>
          </div>
        </div>

        {/* Right Column: Result Area */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 aspect-[9/16] w-full relative flex items-center justify-center overflow-hidden">
            <span className="text-gray-500 text-sm">暂无生成结果</span>
          </div>
        </div>

      </div>
    </div>
  );
}
