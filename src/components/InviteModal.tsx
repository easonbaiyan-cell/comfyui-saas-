"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] max-w-4xl w-full mx-auto rounded-2xl border border-white/10 p-8 shadow-2xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6 stroke-[1.5]" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="w-8 h-[3px] bg-yellow-500 mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-2">邀请好友，获取丰厚现金与积分</h2>
          <p className="text-sm text-gray-400">
            好友通过你的链接注册，首月立享 9 折或获赠 10,000 积分。双向奔赴，轻松裂变。
          </p>
        </div>

        {/* Copy Link Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Left Card: Invite Code */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 font-medium">我的邀请码</span>
              <span className="text-green-500/70 text-sm">已绑定 rh-v1543</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-widest">c19wfslk</span>
              <Button variant="outline" className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6">
                复制
              </Button>
            </div>
          </div>

          {/* Right Card: Invite Link */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-white font-medium">邀请好友链接</span>
              <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-full h-8 px-4 text-xs font-medium transition-colors shadow-lg shadow-purple-500/20">
                复制分享链接 ➔
              </Button>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 text-sm text-gray-400 leading-relaxed mt-auto">
              宝子们，我发现一个AI视频宝藏产品 Papagaga！每天发布数百个超有趣好用的AI工作流。打开链接：https://papagaga.com?inviteCode=c19wfslk 注册即可领取 10,000 积分免费生成视频！
            </div>
          </div>
        </div>

        {/* Reward Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 青铜推手 */}
          <div className="relative flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition-all duration-300">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-300">累计拉新 1-4 人</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">返现 20%</span>
            </div>
            <div className="mt-auto pt-4 text-sm text-gray-500">
              每单赚 ¥136
            </div>
          </div>

          {/* Card 2: 白银推手 */}
          <div className="relative flex flex-col rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#1a1025] to-[#111111] p-6 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-purple-300">累计拉新 5-9 人</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">返现 30%</span>
            </div>
            <div className="mt-auto pt-4 text-sm text-purple-400/70">
              每单赚 ¥204
            </div>
          </div>

          {/* Card 3: 黄金推手 */}
          <div className="relative flex flex-col rounded-2xl border border-yellow-500/40 bg-gradient-to-b from-[#251e0a] to-[#111111] p-6 hover:border-yellow-500/80 hover:shadow-[0_0_25px_rgba(234,179,8,0.2)] transition-all duration-300 scale-[1.02]">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-yellow-500">累计拉新 10 人+</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">返现 40%</span>
            </div>
            <div className="mt-auto pt-4 text-sm text-yellow-500/80">
              每单赚 ¥272 + 赠满配会员
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
