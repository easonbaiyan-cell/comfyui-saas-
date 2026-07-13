"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!open) {
      setPhone("");
      setCode("");
      setError(null);
      setCountdown(0);
      setAgreed(false);
    }
  }, [open]);

  const handleSendOtp = async () => {
    if (!phone) {
      setError("请输入手机号码");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    const formattedPhone = phone.startsWith("+") ? phone : `+86${phone}`;
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      setCountdown(60);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "获取验证码失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("请先阅读并同意服务协议及隐私权政策");
      return;
    }

    if (!code) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);

    const formattedPhone = phone.startsWith("+") ? phone : `+86${phone}`;

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'sms',
      });
      
      if (error) throw error;

      onOpenChange(false); // Close modal on success
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#1C1C1E] text-white border-white/10 p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 w-full" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-semibold">
              Hello, 欢迎来到平台
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              未注册的手机号验证后将自动注册
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                  +86
                </div>
                <Input 
                  type="tel" 
                  placeholder="请输入手机号" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="pl-12 bg-[#2C2C2E] border-none text-white h-12 focus-visible:ring-1 focus-visible:ring-purple-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="请输入验证码" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 bg-[#2C2C2E] border-none text-white h-12 focus-visible:ring-1 focus-visible:ring-purple-500"
                  required
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0 || phone.length < 11}
                  className="h-12 w-[120px] bg-[#2C2C2E] hover:bg-[#3C3C3E] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {countdown > 0 ? `${countdown}s 后重新获取` : "获取验证码"}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#6B46C1] hover:bg-[#553C9A] text-white text-base font-medium rounded-md transition-colors" 
              disabled={loading}
            >
              {loading ? "登录中..." : "登录/注册"}
            </Button>

            <div className="flex items-start space-x-2 mt-4">
              <Checkbox 
                id="terms" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed font-normal cursor-pointer">
                我已经阅读并同意
                <a href="#" className="text-purple-400 hover:underline mx-1">《服务协议》</a>
                和
                <a href="#" className="text-purple-400 hover:underline mx-1">《隐私权政策》</a>
              </Label>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
