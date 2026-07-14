"use client";

import Image from "next/image";
import PricingModal from "./PricingModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, HeadphonesIcon, LogOut, User as UserIcon, Zap, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { User } from "@supabase/supabase-js";

interface NavLink {
  label: string;
  type: "redirect" | "modal";
  url?: string;
  content?: string;
}

export function Header({ logoUrl, navLinks = [] }: { logoUrl?: string, navLinks?: NavLink[] }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
        setAuthModalOpen(false); // Close auth modal if user logs in
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
          <div className="flex items-center gap-3 ml-auto">
              {true || user ? (
                <>
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
                  
                  <div className="flex items-center bg-[#1a1a1a] rounded-full p-1 pl-4 ml-1 h-10 border border-white/5">
                    <div className="hidden md:flex items-center mr-3">
                      <span className="text-xs font-semibold text-white/80 mr-2">会员中心</span>
                      <div className="flex items-center text-sm font-bold text-yellow-500">
                        <Zap className="h-3.5 w-3.5 mr-0.5 fill-current" />
                        <span>6,525</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-user.jpg" alt={user?.phone || "User"} />
                            <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">我的账户</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.phone || user?.email || "Guest"}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>控制台</DropdownMenuItem>
                      <DropdownMenuItem>账单与积分</DropdownMenuItem>
                      <DropdownMenuItem>设置</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>退出登录</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </>
              ) : (
                <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                  登录 / 注册
                </Button>
              )}
          </div>
        </div>
      </header>
      
      {/* Global Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* 新增：Pricing Modal (收费弹窗) */}
      {isPricingOpen && (
        <PricingModal onClose={() => setIsPricingOpen(false)} />
      )}
    </>
  );
}