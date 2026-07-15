"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { XIcon } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError("请输入手机号码");
      return;
    }

    if (!password) {
      setError("请输入密码");
      return;
    }

    setLoading(true);

    const formattedPhone = phone.startsWith("+") ? phone : `+86${phone}`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: password,
      });
      
      if (error) throw error;

      // Note: State reset and closing is handled by the global auth state change listener in Header
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] max-w-md w-full mx-4 rounded-2xl border border-white/10 p-8 relative">
        <button
          onClick={() => {
            // Optional: reset state on close if desired,
            // but closing means the next time it's opened it'll have the old state
            // unless we reset it. Let's just reset when they close.
            setPhone("");
            setPassword("");
            setError(null);
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <XIcon className="w-6 h-6 stroke-[1.5]" />
          <span className="sr-only">Close</span>
        </button>

        <div className="mb-6">
          <div className="w-8 h-[3px] bg-yellow-500 mb-6"></div>
          <h2 className="text-3xl font-bold text-white">登录</h2>
          <p className="text-gray-400 text-sm mt-2 mb-8">连接灵感，驱动生成</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 mb-2">账号</div>
              <div className="flex bg-[#1a1a1a] rounded-lg h-12 focus-within:bg-[#2a2a2a] transition-colors">
                <div className="flex items-center pl-4 pr-2 text-gray-500 text-sm">
                  +86
                </div>
                <input
                  type="tel" 
                  placeholder="请输入手机号" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="flex-1 bg-transparent border-none text-white outline-none px-2"
                  required
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">密码</div>
              <div className="flex bg-[#1a1a1a] rounded-lg h-12 focus-within:bg-[#2a2a2a] transition-colors">
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white outline-none px-4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs text-gray-500 mb-4 text-center">
              登录即代表同意 <a href="#" className="text-gray-300 hover:text-white">用户服务协议</a> 和 <a href="#" className="text-gray-300 hover:text-white">隐私政策</a>
            </div>

            <button
              type="submit" 
              className="w-full h-12 bg-[#a855f7] hover:bg-[#9333ea] text-white text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              disabled={loading}
            >
              {loading ? "登录中..." : "登陆"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
