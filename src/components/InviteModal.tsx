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
          <h2 className="text-3xl font-bold text-white mb-2">邀请好友，各得 500 积分</h2>
          <p className="text-sm text-gray-400">
            送好友 500 积分体验礼！好友通过链接成功注册后，你与好友将各自获得 500 积分奖励。邀请越多，奖励上不封顶！
          </p>
        </div>

        {/* Copy Link Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onClick={() => handleCopy("你有空试一下这个，AI生成出来的视频超级真实，现在有活动，你进去注册就送积分，可以免费生成试一下：https://papagaga.com?inviteCode=c19wfslk", "link")}
              >
                {copiedType === "link" ? "已复制" : "复制分享链接 ➔"}
              </Button>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 text-sm text-gray-400 leading-relaxed mt-auto">
              你有空试一下这个，AI生成出来的视频超级真实，现在有活动，你进去注册就送积分，可以免费生成试一下：https://papagaga.com?inviteCode=c19wfslk
            </div>
          </div>
        </div>

          </BaseModal>
  );
}
