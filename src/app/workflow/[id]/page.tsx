'use client';

import React, { useState } from 'react';
import { Play, UploadCloud, HelpCircle, Minus, Plus, Zap, Heart, MessageCircle, Download, Trash2, Share2, RefreshCw } from 'lucide-react';

export default function WorkflowDetailPage() {
  const [isMaskMode, setIsMaskMode] = useState(false);
  const [skipFrames, setSkipFrames] = useState(0);

  const handleDecreaseFrames = () => {
    setSkipFrames((prev) => Math.max(0, prev - 1));
  };

  const handleIncreaseFrames = () => {
    setSkipFrames((prev) => prev + 1);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] text-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full w-full">
        {/* Left Column: Showcase Video */}
        <div className="border-r border-white/5 p-6 flex flex-col items-center justify-start overflow-y-auto">
          <div className="w-full max-w-sm flex flex-col">
            <h1 className="text-lg font-semibold text-white mb-6 text-center">参考视频</h1>

            {/* Video Placeholder */}
            <div className="bg-[#131622] rounded-2xl aspect-[9/16] w-full relative flex items-center justify-center shadow-xl overflow-hidden group">
              <button className="h-16 w-16 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-[#a855f7]/80 transition-all backdrop-blur-md border border-white/10">
                <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
              </button>

              {/* Social Heat Data Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">小红书</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    <span>12.5w</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>1.2w</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invisible Spacer to align with right column's action buttons */}
            <div className="h-9 mt-4"></div>

            {/* Traffic Analysis Text */}
            <p className="text-xs text-gray-500 leading-relaxed mt-4">
              参考作品来源小红书平台，它的点赞达到了 12.5 W，评论达到 1.2 W，具备非常好的引流能力。
            </p>
          </div>
        </div>

        {/* Middle Column: Parameters and Actions */}
        <div className="border-r border-white/5 overflow-y-auto h-full relative flex flex-col">
          <div className="p-6 flex-1 w-full max-w-sm mx-auto flex flex-col">
            <h1 className="text-lg font-semibold text-white mb-6 text-center">工作流详情与操作</h1>

            {/* Upload Zone */}
            <div className="mb-10 w-full">
              <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">参考图片上传</h2>
              <div className="border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 bg-black/40 rounded-full flex items-center justify-center border border-white/5">
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-base font-medium text-white mb-1">点击或拖拽图片至此</p>
                  <p className="text-xs text-gray-500">支持 JPG, PNG, WEBP 等格式</p>
                </div>
              </div>
            </div>

            {/* Parameters Section */}
            <div className="mb-10">
              <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">参数设置</h2>

              {/* Component A: Select */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-3 flex items-center justify-between border border-transparent hover:border-white/5 transition-colors">
                <span className="text-sm text-gray-200">分辨率</span>
                <select className="bg-[#131622] text-white text-sm border border-white/10 rounded-md px-3 py-1.5 focus:outline-none focus:border-[#a855f7] appearance-none cursor-pointer hover:bg-[#1a1f33] transition-colors outline-none w-32 text-center">
                  <option value="720p">720P (竖屏)</option>
                  <option value="1080p">1080P (竖屏)</option>
                  <option value="4k">4K (超清)</option>
                </select>
              </div>

              {/* Component B: Toggle */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-3 flex items-center justify-between border border-transparent hover:border-white/5 transition-colors">
                <span className="text-sm text-gray-200">开启面具头盔模式</span>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isMaskMode ? 'bg-[#a855f7]' : 'bg-gray-700'}`}
                  onClick={() => setIsMaskMode(!isMaskMode)}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isMaskMode ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </div>
              </div>

              {/* Component C: Stepper */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-3 flex items-center justify-between border border-transparent hover:border-white/5 transition-colors">
                <span className="text-sm text-gray-200">跳过前面多少帧</span>
                <div className="flex items-center gap-1 bg-[#131622] rounded-md p-1 border border-white/5">
                  <button
                    onClick={handleDecreaseFrames}
                    className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-10 text-center text-sm font-medium">
                    {skipFrames}
                  </div>
                  <button
                    onClick={handleIncreaseFrames}
                    className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Some extra padding at the bottom so content isn't hidden by sticky bar */}
            <div className="h-20"></div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-0 left-0 right-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10 p-4 px-6">
            <div className="w-full mx-auto flex flex-col items-center justify-between gap-4">
              {/* Cost Estimation */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">预估</span>
                <span className="text-sm text-gray-400">≈</span>
                <div className="flex items-center gap-1 text-yellow-500 font-semibold bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                  <Zap className="h-4 w-4 fill-current" />
                  <span>104 积分</span>
                </div>
                <div className="relative group cursor-help ml-1">
                  <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 text-xs text-gray-300 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                    最终以实际生成时间换算为准
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button className="w-full bg-[#a855f7] hover:bg-purple-600 text-white font-bold text-lg h-14 px-12 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center">
                立即运行
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Video and Actions */}
        <div className="p-6 flex flex-col items-center justify-start overflow-y-auto h-full">
          <div className="w-full max-w-sm flex flex-col">
            <h1 className="text-lg font-semibold text-white mb-6 text-center">生成视频</h1>

            {/* Video Placeholder */}
            <div className="bg-[#131622] rounded-2xl aspect-[9/16] w-full relative flex items-center justify-center shadow-xl overflow-hidden">
              <span className="text-gray-600 text-sm">暂无生成视频</span>
            </div>

            {/* Action Buttons (aligned with left column spacer) */}
            <div className="flex justify-center gap-4 mt-4 h-9 items-center">
              <button className="text-gray-400 hover:text-white p-2 transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-white p-2 transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-white p-2 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-white p-2 transition-colors">
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {/* Data Records Text (aligned with left column analysis text) */}
            <div className="text-xs text-gray-500 flex flex-col gap-1 mt-4">
              <span>生成时间：2026.07.15-14:30:17</span>
              <span>运行时长：12:35</span>
              <span>有效期：<span className="text-yellow-500/80">9</span>天后过期</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
