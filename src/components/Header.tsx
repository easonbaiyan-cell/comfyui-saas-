"use client";

import Image from "next/image";
import PricingModal from "./PricingModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, HeadphonesIcon, LogOut, User as UserIcon } from "lucide-react";
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
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{title: string, body: string}>({ title: "", body: "" });
  
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

  const handleLinkClick = (link: NavLink) => {
    if (link.type === "modal") {
      setInfoModalContent({ title: link.label, body: link.content || "" });
      setInfoModalOpen(true);
    }
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
          <div className="flex items-center gap-6 ml-auto">
            {/* Navigation links moved to the right */}
            <nav className="hidden md:flex gap-6 items-center">
              
              {/* 新增的 About 按钮，点击唤起收费弹窗 */}
              <button
                onClick={() => setIsPricingOpen(true)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                关于 (About)
              </button>

              <Link
                href="/invite"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Invite & Earn
              </Link>
              
              {navLinks.map((link, i) => (
                link.type === "redirect" ? (
                  <Link
                    key={i}
                    href={link.url || "#"}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={i}
                    onClick={() => handleLinkClick(link)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <HeadphonesIcon className="h-5 w-5" />
                  </Button>
                  
                  {/* 会员超市 按钮也绑定了唤起收费弹窗 */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="hidden sm:flex border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 text-purple-500"
                    onClick={() => setIsPricingOpen(true)}
                  >
                    会员超市
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt={user.phone || "User"} />
                          <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">我的账户</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.phone || user.email}
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
                </>
              ) : (
                <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                  登录 / 注册
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Info Modal */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoModalContent.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm whitespace-pre-wrap">
            {infoModalContent.body}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Global Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* 新增：Pricing Modal (收费弹窗) */}
      {isPricingOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsPricingOpen(false)}
        >
          <div 
            className="relative max-h-screen overflow-y-auto w-full flex justify-center p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <PricingModal />
          </div>
        </div>
      )}
    </>
  );
}