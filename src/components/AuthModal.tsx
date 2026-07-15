"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { XIcon } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleGetCode = () => {
    if (!account) {
      setError("请输入手机号 / 邮箱");
      return;
    }
    setError(null);
    setCountdown(60);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginMode === "otp") {
      setError("短信服务尚未配置，请暂时使用密码登录");
      return;
    }

    if (!account) {
      setError("请输入手机号 / 邮箱");
      return;
    }

    if (!password) {
      setError("请输入密码");
      return;
    }

    setLoading(true);

    try {
      let authError;
      if (account.includes("@")) {
        const { error } = await supabase.auth.signInWithPassword({
          email: account,
          password: password,
        });
        authError = error;
      } else {
        const formattedPhone = account.startsWith("+") ? account : `+86${account}`;
        const { error } = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password: password,
        });
        authError = error;
      }
      
      if (authError) throw authError;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] max-w-md w-full mx-4 rounded-2xl border border-white/10 p-8 relative">
        <button
          onClick={() => {
            setAccount("");
            setPassword("");
            setCode("");
            setLoginMode("password");
            setCountdown(0);
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
                <input
                  type="text"
                  placeholder="手机号 / 邮箱"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white outline-none px-4"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-400">
                  {loginMode === "password" ? "密码" : "验证码"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode(loginMode === "password" ? "otp" : "password");
                    setError(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {loginMode === "password" ? "验证码登录" : "密码登录"}
                </button>
              </div>

              <div className="flex bg-[#1a1a1a] rounded-lg h-12 focus-within:bg-[#2a2a2a] transition-colors overflow-hidden">
                {loginMode === "password" ? (
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white outline-none px-4"
                    required
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="请输入验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 bg-transparent border-none text-white outline-none px-4"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetCode}
                      disabled={countdown > 0}
                      className="px-4 text-sm text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium border-l border-white/5 bg-[#222]"
                    >
                      {countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                    </button>
                  </>
                )}
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
              {loading ? "登录中..." : "立即登录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
