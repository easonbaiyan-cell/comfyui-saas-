"use client";

import Image from "next/image";
import PricingModal from "./PricingModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, HeadphonesIcon, LogOut, User as UserIcon, Zap, Home, Video, CreditCard, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

interface NavLink {
  label: string;
  type: "redirect" | "modal";
  url?: string;
  content?: string;
}

export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // 新增：控制定价页面弹窗的开关
  const [isPricingOpen, setIsPricingOpen] = useState(false); 
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setIsAuthOpen(false); // Close auth modal if user logs in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo Only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src={logoUrl || "/logo.png"} 
                alt="Logo" 
                width={120} 
                height={32} 
                className="h-8 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Right: Navigation and Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* 1. 常驻展示区：放在鉴权判断的外部，永远显示 */}
            <Link
              href="/invite"
              className="hidden sm:flex items-center bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#d4af37] px-4 py-2 rounded-full text-sm font-medium transition-colors border border-[#d4af37]/30 h-10 mr-2"
            >
              邀请获取积分
            </Link>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white bg-[#1a1a1a] rounded-xl h-10 w-10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-[#1a1a1a]"></span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white bg-[#1a1a1a] rounded-xl h-10 w-10">
              <HeadphonesIcon className="h-5 w-5" />
            </Button>

            {/* 会员超市 按钮绑定了唤起收费弹窗 */}
            <Button
              size="sm"
              className="hidden sm:flex bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#00e5ff] border border-transparent hover:border-[#00e5ff]/30 px-4 rounded-xl h-10"
              onClick={() => setIsPricingOpen(true)}
            >
              <Home className="mr-2 h-4 w-4" />
              会员超市
            </Button>

            {/* 2. 鉴权状态区：根据用户状态切换 */}
            {user ? (
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 bg-[#131622] hover:bg-[#1a1f33] border border-white/5 px-4 py-1.5 rounded-full transition-all cursor-pointer select-none">
                        <span className="text-xs text-gray-400 font-medium">会员中心</span>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-bold text-white">6,525</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-gray-800">
                          <UserIcon className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl p-2 z-50">
                      <div className="px-3 py-3 mb-1 border-b border-white/5 flex flex-col gap-1">
                        <p className="text-sm font-semibold text-white">
                          {user?.phone || user?.email || "Guest"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-yellow-500/90">
                          <Zap className="h-3 w-3 fill-current" />
                          <span>6,525 积分</span>
                        </div>
                      </div>

                      <DropdownMenuItem render={
                        <Link href="/dashboard?tab=creations" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <Video className="h-4 w-4" />
                          <span>我的创作</span>
                        </Link>
                      } />

                      <DropdownMenuItem render={
                        <Link href="/dashboard?tab=billing" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <CreditCard className="h-4 w-4" />
                          <span>积分与账单</span>
                        </Link>
                      } />

                      <DropdownMenuItem render={
                        <Link href="/dashboard?tab=settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <Settings className="h-4 w-4" />
                          <span>个人设置</span>
                        </Link>
                      } />

                      <hr className="border-white/5 my-1" />

                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 rounded-lg transition-colors cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span>退出登录</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            ) : (
              <Button
                  className="bg-white text-black hover:bg-gray-100 rounded-full font-medium"
                  onClick={() => setIsAuthOpen(true)}
                >
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* 新增：Pricing Modal (收费弹窗) */}
      {isPricingOpen && (
        <PricingModal onClose={() => setIsPricingOpen(false)} />
      )}
    </>
  );
}