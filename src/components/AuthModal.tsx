"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { XIcon } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  type LoginMode = "phone-password" | "phone-otp" | "email-password";
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginMode, setLoginMode] = useState<LoginMode>("phone-password");
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
      setError("请输入手机号");
      return;
    }
    setError(null);
    setCountdown(60);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginMode === "phone-otp") {
      setError("短信服务暂未配置，请使用密码或邮箱登录");
      return;
    }

    if (!account) {
      setError(loginMode === "email-password" ? "请输入邮箱" : "请输入手机号");
      return;
    }

    if (!password) {
      setError("请输入密码");
      return;
    }

    setLoading(true);

    try {
      let authError;
      const formattedAccount = loginMode === "email-password"
        ? account
        : (account.startsWith("+") ? account : `+86${account}`);

      const signInOptions = loginMode === "email-password"
        ? { email: account, password }
        : { phone: formattedAccount, password };

      const { error } = await supabase.auth.signInWithPassword(signInOptions);
      authError = error;
      
      if (authError) {
        if (authError.message.includes("Invalid login credentials") || authError.message.includes("not found") || authError.message.includes("Invalid")) {
          // Attempt sign up
          const { error: signUpError } = await supabase.auth.signUp(signInOptions);
          if (signUpError) {
             throw signUpError;
          }
        } else {
          throw authError;
        }
      }

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
            setLoginMode("phone-password");
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
          <div className="w-8 h-[3px] bg-lime-300 mb-6"></div>
          <h2 className="text-3xl font-bold text-white">登录</h2>
          <p className="text-gray-400 text-sm mt-2 mb-8 text-left">连接灵感，驱动生成</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 mb-2">账号</div>
              <div className="flex bg-[#1a1a1a] rounded-lg h-12 focus-within:bg-[#2a2a2a] transition-colors overflow-hidden">
                {loginMode !== "email-password" && (
                  <div className="flex items-center px-4 text-gray-400 bg-[#222] border-r border-white/5">
                    +86
                  </div>
                )}
                <input
                  type={loginMode === "email-password" ? "email" : "tel"}
                  placeholder={loginMode === "email-password" ? "请输入邮箱" : "请输入手机号"}
                  value={account}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (loginMode !== "email-password") {
                      setAccount(val.replace(/[^0-9]/g, ""));
                    } else {
                      setAccount(val);
                    }
                  }}
                  className="flex-1 bg-transparent border-none text-white outline-none px-4"
                  required
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">
                {loginMode === "phone-otp" ? "验证码" : "密码"}
              </div>
              <div className="flex bg-[#1a1a1a] rounded-lg h-12 focus-within:bg-[#2a2a2a] transition-colors overflow-hidden">
                {loginMode !== "phone-otp" ? (
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
                      className="px-4 text-sm text-lime-300 hover:brightness-110 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-medium border-l border-white/5 bg-[#222]"
                    >
                      {countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {error && (
              <div className="text-red-500 text-xs mb-4 text-center">
                {error}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4 text-center">
              登录即代表同意 <a href="#" className="text-lime-300 hover:brightness-110">[用户服务协议]</a> 和 <a href="#" className="text-lime-300 hover:brightness-110">[隐私政策]</a>
            </div>

            <button
              type="submit" 
              className="w-full h-12 bg-lime-300 hover:brightness-110 text-black text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
              disabled={loading}
            >
              {loading ? "登录中..." : "立即登录"}
            </button>

            <div className="mt-6 flex items-center justify-center">
              <span className="text-[#444] text-xs font-medium">—— OR ——</span>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setLoginMode(loginMode === "email-password" ? "phone-password" : "email-password");
                  setError(null);
                  setAccount("");
                  setPassword("");
                  setCode("");
                }}
                className="flex-1 h-10 border border-[#333] hover:border-lime-300/50 text-gray-400 hover:text-white rounded-lg text-sm transition-colors bg-transparent"
              >
                {loginMode === "email-password" ? "手机号登录" : "邮箱登录"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode(loginMode === "phone-otp" ? "phone-password" : "phone-otp");
                  setError(null);
                  setPassword("");
                  setCode("");
                  if (loginMode === "email-password") setAccount("");
                }}
                className="flex-1 h-10 border border-[#333] hover:border-lime-300/50 text-gray-400 hover:text-white rounded-lg text-sm transition-colors bg-transparent"
              >
                {loginMode === "phone-otp" ? "密码登录" : "验证码登录"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
