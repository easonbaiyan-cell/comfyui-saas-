"use client";

import { useState } from "react";
import Image from "next/image";

export default function SettingsPage() {
  // Profile Mock State
  const [nickname, setNickname] = useState("Jules Explorer");
  const [email, setEmail] = useState("jules@example.com");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Mock State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Handlers
  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSavingProfile(false);
    alert("基础信息已保存成功");
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("两次输入的新密码不一致，请重新输入");
      return;
    }
    setIsUpdatingPassword(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    alert("密码已更新成功");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">个人设置</h1>
          <p className="text-sm text-gray-400">管理您的基础信息和账号安全</p>
        </div>

        {/* Section 1: Profile (基础信息) */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">基础信息</h2>

          <div className="space-y-6">
            {/* Avatar Row */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/20">
                <Image
                  src="https://picsum.photos/160/160?random=1"
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                  更换头像
                </button>
                <button className="px-4 py-2 text-sm font-medium border border-transparent text-gray-400 hover:text-red-400 transition-colors">
                  移除
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300 transition-all placeholder:text-gray-500"
                  placeholder="请输入您的昵称"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">账号/邮箱</label>
                <input
                  type="text"
                  value={email}
                  disabled
                  className="w-full bg-[#1a1a1a]/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="bg-lime-300 text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-lime-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? "保存中..." : "保存更改"}
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Security (账号安全) */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">账号安全</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">当前密码</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-500"
                placeholder="请输入当前密码"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-500"
                placeholder="请输入新密码"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-500"
                placeholder="请再次输入新密码"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 flex">
              <button
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? "更新中..." : "更新密码"}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
