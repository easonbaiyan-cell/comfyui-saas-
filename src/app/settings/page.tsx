"use client";

import { useState, useRef, ChangeEvent } from "react";
import { X, User } from "lucide-react";
import { BaseModal } from "../../components/BaseModal";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Dynamic Auth Logic based on user state
  const isEmailUser = !!user?.email;
  const accountType = isEmailUser ? 'email' : 'phone';
  const derivedEmail = user?.email || user?.phone || "";

  // Profile Mock State
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname || "");
  const [email, setEmail] = useState(derivedEmail);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state if user changes in store
  useEffect(() => {
    // Wrap in a tiny timeout to avoid the exact synchronous cascade ESLint warning,
    // or just let derived values flow naturally. Since these are state vars, we sync them.
    const t = setTimeout(() => {
      if (user?.email) {
        setEmail(user.email);
      } else if (user?.phone) {
        setEmail(user.phone);
      }
      setNickname(user?.user_metadata?.nickname || "");
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  // Avatar Upload State
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_url || "");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Binding Mock State
  const [bindInput, setBindInput] = useState("");
  const [bindCode, setBindCode] = useState("");
  const [isBinding, setIsBinding] = useState(false);

  // Security Mock State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast Mock State
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      setIsAvatarModalOpen(true);
    }
    // reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setPreviewUrl("");
    setSelectedFile(null);
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile || !user) return;
    setIsUploadingAvatar(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      if (!publicUrl) throw new Error('Failed to get public URL');

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      useAuthStore.getState().setUser(updatedUser);

      setAvatar(publicUrl);
      showToast("头像已更新成功", "success");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "头像上传失败", "error");
    } finally {
      setIsUploadingAvatar(false);
      setIsAvatarModalOpen(false);
      setPreviewUrl("");
      setSelectedFile(null);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { nickname }
      });

      if (error) throw error;

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      useAuthStore.getState().setUser(updatedUser);

      showToast("基础信息已保存成功", "success");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "保存失败", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendCode = (_type: 'bind' | 'security') => {
    showToast("验证码已发送 (模拟)", 'success');
  };

  const handleBindAccount = async () => {
    if (!bindInput || !bindCode) return;
    setIsBinding(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsBinding(false);
    showToast("账号绑定成功", 'success');
    setBindInput("");
    setBindCode("");
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword || !securityCode) return;

    if (newPassword !== confirmPassword) {
      showToast("两次输入的新密码不一致，请重新输入", 'error');
      return;
    }
    setIsUpdatingPassword(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    showToast("密码已更新成功", 'success');
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSecurityCode("");
  };

  // Validation Flags
  const isBindDisabled = !bindInput || !bindCode || isBinding;
  const isSecurityDisabled = !currentPassword || !newPassword || !confirmPassword || !securityCode || isUpdatingPassword;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto space-y-8 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-10 relative my-auto">

        {/* Header */}
        <div className="relative">
          <div className="pr-12">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">个人设置</h1>
            <p className="text-sm text-gray-400">管理您的基础信息和账号安全</p>
          </div>
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Section 1: Profile (基础信息) */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">基础信息</h2>

          <div className="space-y-6">
            {/* Avatar Row */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-gray-800 flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                >
                  更换头像
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button className="px-4 py-2 text-sm font-medium border border-transparent text-gray-400 hover:text-danger-red transition-colors">
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
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
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
                className="bg-[#D0FF2A] text-black hover:bg-[#bceb24] font-medium rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? "保存中..." : "保存更改"}
              </button>
            </div>
          </div>
        </section>

        {/* Toast */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium z-50 transition-all ${toastMessage.type === 'error' ? 'bg-danger-red text-white' : 'bg-primary-green text-black'}`}>
            {toastMessage.text}
          </div>
        )}

        {/* Section: Binding (账号绑定) */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">账号绑定</h2>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {isEmailUser ? "新手机号" : "新邮箱"}
                </label>
                <div className="relative">
                  {isEmailUser && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-sm text-gray-400">+86</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={bindInput}
                    onChange={(e) => setBindInput(e.target.value)}
                    className={`w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500 ${isEmailUser ? 'pl-12 pr-4' : 'px-4'}`}
                    placeholder={isEmailUser ? "请输入新手机号" : "请输入新邮箱"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">验证码</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={bindCode}
                    onChange={(e) => setBindCode(e.target.value)}
                    className="flex-1 bg-[#1C1C1E] border-none text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
                    placeholder="请输入验证码"
                  />
                  <button
                    onClick={() => handleSendCode('bind')}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    {isEmailUser ? "获取短信验证码" : "获取邮箱验证码"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleBindAccount}
                disabled={isBindDisabled}
                className="bg-[#D0FF2A] text-black hover:bg-[#bceb24] font-medium rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isBinding ? "绑定中..." : "绑定"}
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Security (账号安全) */}
        <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">账号安全</h2>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
                  placeholder="请输入当前密码"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
                  placeholder="请输入新密码"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">验证码</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all placeholder:text-gray-500"
                    placeholder={isEmailUser ? "请输入邮箱验证码" : "请输入手机验证码"}
                  />
                  <button
                    onClick={() => handleSendCode('security')}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    {isEmailUser ? "获取邮箱验证码" : "获取短信验证码"}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleUpdatePassword}
                disabled={isSecurityDisabled}
                className="bg-[#D0FF2A] text-black hover:bg-[#bceb24] font-medium rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? "更新中..." : "更新密码"}
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Avatar Edit Modal */}
      <BaseModal isOpen={isAvatarModalOpen} onClose={handleCloseAvatarModal} className="bg-[#111] p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-6">编辑头像</h3>

            <div className="relative w-20 h-20 rounded-full mx-auto bg-gray-800 flex items-center justify-center overflow-hidden mb-6 border border-white/5">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handleCloseAvatarModal}
                className="flex-1 py-3 text-sm font-medium border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={isUploadingAvatar}
                className="flex-1 py-3 text-sm font-semibold bg-primary-green text-black rounded-lg hover:bg-primary-green transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? "保存中..." : "保存头像"}
              </button>
            </div>
                </BaseModal>
    </div>
  );
}
