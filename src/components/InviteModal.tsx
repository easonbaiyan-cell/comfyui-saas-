"use client";

import { Button } from "./ui/button";
import { BaseModal } from "./BaseModal";
import { useState } from "react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [copiedType, setCopiedType] = useState<"code" | "link" | null>(null);

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-auto p-8 font-sans">
        {/* Header Section */}
        <div className="mb-8">
          <div className="w-8 h-[3px] bg-primary-green mb-6"></div>
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
              <span className="text-primary-green/70 text-sm">已绑定 rh-v1543</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-widest">c19wfslk</span>
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white px-6 transition-all"
                onClick={() => handleCopy("c19wfslk", "code")}
              >
                {copiedType === "code" ? "已复制" : "复制"}
              </Button>
            </div>
          </div>

          {/* Right Card: Invite Link */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-white font-medium">邀请好友链接</span>
              <Button
                className="bg-primary-green hover:bg-primary-green/80 text-black rounded-full h-8 px-4 text-xs font-medium transition-colors shadow-lg shadow-primary-green/20"
                onClick={() => handleCopy("宝子们，我发现一个AI视频宝藏产品 Papagaga！每天发布数百个超有趣好用的AI工作流。打开链接：https://papagaga.com?inviteCode=c19wfslk 注册即可领取 10,000 积分免费生成视频！", "link")}
              >
                {copiedType === "link" ? "已复制" : "复制分享链接 ➔"}
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
          <div className="relative flex flex-col rounded-2xl border border-primary-green/30 bg-gradient-to-b from-[#1a1025] to-[#111111] p-6 hover:border-primary-green/60 hover:shadow-[0_0_15px_var(--color-primary-green)] transition-all duration-300">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-primary-green">累计拉新 5-9 人</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">返现 30%</span>
            </div>
            <div className="mt-auto pt-4 text-sm text-primary-green/70">
              每单赚 ¥204
            </div>
          </div>

          {/* Card 3: 黄金推手 */}
          <div className="relative flex flex-col rounded-2xl border border-primary-green/40 bg-gradient-to-b from-[#251e0a] to-[#111111] p-6 hover:border-primary-green/80 hover:shadow-[0_0_15px_var(--color-primary-green)] transition-all duration-300 scale-[1.02]">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-primary-green">累计拉新 10 人+</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">返现 40%</span>
            </div>
            <div className="mt-auto pt-4 text-sm text-primary-green/80">
              每单赚 ¥272 + 赠满配会员
            </div>
          </div>
        </div>
          </BaseModal>
  );
}
