"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Wallet, Users, Info, ArrowUpRight, Crown, Receipt, ShieldAlert } from "lucide-react";

export default function AffiliatePage() {
  const router = useRouter();
  const { user, isDistributor } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"invites" | "bills">("invites");
  const [isClient, setIsClient] = useState(false);

  // Use a local state for rendering to prevent hydration mismatch for complex auth logic
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Route protection
  useEffect(() => {
    if (isClient) {
      if (!user) {
        // Option 1: Wait for auth maybe? We just redirect to home if no user and it's client side.
        router.push("/");
      } else if (!isDistributor) {
        router.push("/");
      }
    }
  }, [user, isDistributor, router, isClient]);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  // Double check before rendering content
  if (!user || !isDistributor) {
    return null; // Don't flash content before redirect
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary-green" />
              分销中心
            </h1>
            <p className="text-gray-400 text-sm mt-1">专属经销商后台与账单总览</p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 max-w-lg w-full md:w-auto">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <p>本页面仅作收益记账，实际结算请联系专属商务进行线下打款</p>
          </div>
        </div>

        {/* Data Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-green/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">累计预估收益（￥）</span>
              </div>
              <Info className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              0.00
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-green/5 rounded-full blur-2xl group-hover:bg-primary-green/10 transition-colors" />
          </div>

          <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-green/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Receipt className="w-4 h-4" />
                <span className="text-sm">可结算余额（￥）</span>
              </div>
              <button className="text-xs text-primary-green hover:underline flex items-center">
                去结算 <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
            <div className="text-3xl font-bold text-primary-green tracking-tight">
              0.00
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm">我邀请的用户数</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              0
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl mt-8 overflow-hidden">
          <div className="border-b border-white/5">
            <div className="flex px-4">
              <button
                onClick={() => setActiveTab("invites")}
                className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "invites"
                    ? "text-white border-primary-green"
                    : "text-gray-400 border-transparent hover:text-gray-200"
                }`}
              >
                我的邀请记录
              </button>
              <button
                onClick={() => setActiveTab("bills")}
                className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "bills"
                    ? "text-white border-primary-green"
                    : "text-gray-400 border-transparent hover:text-gray-200"
                }`}
              >
                分佣账单
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "invites" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">暂无邀请记录</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  您还没有邀请任何用户注册。分享您的专属链接，开始建立您的分销网络吧。
                </p>
                <button className="mt-6 px-4 py-2 bg-primary-green text-black font-medium text-sm rounded-lg hover:bg-[#bceb24] transition-colors">
                  复制专属邀请链接
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">暂无分佣账单</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  当您的邀请用户产生付费行为后，这里将显示您的账单明细。
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
