"use client";

import PricingModal from "./PricingModal";
import { PointsModal } from "./PointsModal";
import { InviteModal } from "./InviteModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bell, HeadphonesIcon, LogOut, User as UserIcon, Zap, Home, Video, CreditCard, Settings, X, Crown, Coins, Download, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import type { User } from "@supabase/supabase-js";

import { useAuthStore } from "@/store/auth";

interface NavLink {
  label: string;
  type: "redirect" | "modal";
  url?: string;
  content?: string;
}

const isImageUrl = (url: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');
};

export function Header({ logoUrl }: { logoUrl?: string, navLinks?: NavLink[] }) {
  const points = useAuthStore(state => state.积分余额);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // 新增：控制定价页面弹窗的开关
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);
  // 新增：控制邀请页面弹窗的开关
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  // 新增：控制客服弹窗
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  // 新增：控制消息抽屉
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  // 新增：控制用户下拉菜单
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(true);
  const [messageTab, setMessageTab] = useState<"official" | "tasks">("tasks");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videoTasks, setVideoTasks] = useState<any[]>([]);
  
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMessageOpen && user) {
      // initial fetch
      const fetchTasks = async () => {
        const { data } = await supabase
          .from('video_tasks')
          .select('*, workflows(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setVideoTasks(data);
      };

      fetchTasks();

      interval = setInterval(fetchTasks, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMessageOpen, user]);


  const set积分余额 = useAuthStore(state => state.set积分余额);

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic update
    setVideoTasks(prev => prev.filter(t => t.id !== taskId));

    const { error } = await supabase
      .from('video_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error("Delete task failed", error);
    }
  };


  useEffect(() => {
    // 强制切除 406 污染源
    // if (user?.id) {
    //   const fetchPoints = async () => {
    //     const { data } = await supabase
    //       .from('profiles')
    //       .select('points')
    //       .eq('id', user.id)
    //       .single();
    //     if (data && data.points !== undefined) {
    //       set积分余额(data.points);
    //     }
    //   };
    //
    //   fetchPoints();
    //   const intervalId = setInterval(fetchPoints, 10000); // sync every 10s
    //   return () => clearInterval(intervalId);
    // }
  }, [user?.id, set积分余额]);

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
  }, [setUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="relative z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo Only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src={logoUrl || "/logo.png"} 
                alt="Logo" 
                className="h-5 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right: Navigation and Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* 1. 常驻展示区：放在鉴权判断的外部，永远显示 */}
            <button
              onClick={() => setIsInviteOpen(true)}
              className="hidden sm:flex items-center bg-[#1a1a1a] hover:bg-[#2a2a2a] text-primary-green px-4 py-2 rounded-full text-sm font-medium transition-colors border border-primary-green/30 h-10 mr-2"
            >
              邀请获取积分
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-white bg-[#1a1a1a] rounded-xl h-10 w-10 relative"
              onClick={() => { setIsMessageOpen(true); setUnreadMessages(false); }}
            >
              <Bell className="h-5 w-5" />
              {unreadMessages && <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-primary-green ring-2 ring-[#1a1a1a]"></span>}
            </Button>
            <div
              className="relative"
              onMouseEnter={() => setIsCustomerServiceOpen(true)}
              onMouseLeave={() => setIsCustomerServiceOpen(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-white bg-[#1a1a1a] rounded-xl h-10 w-10"
                onClick={() => setIsCustomerServiceOpen(!isCustomerServiceOpen)}
              >
                <HeadphonesIcon className="h-5 w-5" />
              </Button>

              {isCustomerServiceOpen && (
                <div className="absolute mt-2 right-0 z-50 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl w-48">
                  <div className="text-center text-xs text-gray-400">扫码添加专属客服</div>
                  <div className="w-32 h-32 bg-white rounded-md mx-auto mt-2 flex items-center justify-center text-black/50 text-xs">
                    二维码占位
                  </div>
                </div>
              )}
            </div>

            {/* 会员超市 按钮绑定了唤起收费弹窗 */}
            <Button
              size="sm"
              className="hidden sm:flex bg-[#1a1a1a] hover:bg-[#2a2a2a] text-primary-green border border-transparent hover:border-primary-green/30 px-4 rounded-xl h-10"
              onClick={() => setIsPricingOpen(true)}
            >
              <Home className="mr-2 h-4 w-4" />
              会员超市
            </Button>

            {/* 2. 鉴权状态区：根据用户状态切换 */}
            {user ? (
              <div className="relative">
                <div
                  className="flex items-center gap-3 bg-[#131622] hover:bg-[#1a1f33] border border-white/5 px-4 py-1.5 rounded-full transition-all cursor-pointer select-none"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <span className="text-xs text-gray-400 font-medium">会员中心</span>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary-green fill-current" />
                    <span className="text-sm font-bold text-white">{points.toLocaleString()}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-gray-800">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </div>

                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl p-3 z-[100]">
                      {/* 1. 基础账号信息 */}
                      <div className="px-2 pb-3 mb-3 border-b border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-gray-800 shrink-0">
                          {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          {user?.user_metadata?.nickname && (
                            <p className="text-sm font-semibold text-white truncate">
                              {user.user_metadata.nickname}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 truncate">
                            {user?.phone || user?.email || "Guest"}
                          </p>
                        </div>
                      </div>

                      {/* 2. 会员状态卡片 */}
                      <div className="bg-primary-green rounded-xl p-3 flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-black font-bold text-sm">
                            <Crown className="h-4 w-4" />
                            <span>专业版 Plus会员</span>
                          </div>
                          <span className="text-black/70 text-xs mt-0.5">2026/08/03到期</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsPricingOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                        >
                          升级
                        </button>
                      </div>

                      {/* 3. 积分状态与充值区 */}
                      <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-center justify-between mb-3 border border-white/5">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Coins className="h-4 w-4" />
                          <span className="text-xs">剩余积分</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-primary-green font-bold text-lg font-mono tracking-tight">{points.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              setIsPointsOpen(true);
                              setIsProfileDropdownOpen(false);
                            }}
                            className="bg-[#2a2a2a] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#3a3a3a] transition-colors"
                          >
                            充值
                          </button>
                        </div>
                      </div>

                      {/* 4. 常规功能导航菜单 */}
                      <div className="flex flex-col gap-0.5">
                        <Link href="/workspace" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <Video className="h-4 w-4" />
                          <span>我的创作</span>
                        </Link>

                        <Link href="/billing" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <CreditCard className="h-4 w-4" />
                          <span>积分与账单</span>
                        </Link>

                        <Link href="/settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer focus:bg-white/5 focus:text-white w-full">
                          <Settings className="h-4 w-4" />
                          <span>个人设置</span>
                        </Link>

                        <hr className="border-white/5 my-1" />

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center w-full gap-3 px-2 py-2.5 text-sm text-danger-red hover:text-danger-red hover:bg-danger-red/10 focus:bg-danger-red/10 focus:text-danger-red rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
      
      {/* 新增：Points Modal (积分充值弹窗) */}
      <PointsModal isOpen={isPointsOpen} onClose={() => setIsPointsOpen(false)} />

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* 新增：Pricing Modal (收费弹窗) */}
      {isPricingOpen && (
        <PricingModal onClose={() => setIsPricingOpen(false)} />
      )}

      {/* 新增：Invite Modal (邀请弹窗) */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      {/* 消息侧边抽屉 */}
      {isMessageOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMessageOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a0a] border-l border-white/10 z-50 transform transition-transform duration-300 ${
          isMessageOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">消息中心</h2>
            <button
              onClick={() => setIsMessageOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 分类 Tab */}
          <div className="px-4 border-b border-white/5 flex gap-4">
            <div
              className={`cursor-pointer inline-block py-3 text-sm font-medium transition-colors ${messageTab === 'tasks' ? 'text-white border-b-2 border-primary-green' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
              onClick={() => setMessageTab('tasks')}
            >
              生成任务
            </div>
            <div
              className={`cursor-pointer inline-block py-3 text-sm font-medium transition-colors ${messageTab === 'official' ? 'text-white border-b-2 border-primary-green' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
              onClick={() => setMessageTab('official')}
            >
              官方消息
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            {messageTab === "official" ? (
              <div className="text-center text-gray-500 text-sm mt-10">暂无消息</div>
            ) : (
              <div className="flex flex-col gap-3">
                {videoTasks.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-10">暂无生成任务</div>
                ) : (
                  videoTasks.map(task => {
                    const isSuccess = !!task.result_video_url || task.status === 'success';
                    const isFailed = task.status === 'failed';
                    let modelName = 'Unknown Workflow';
                    if (task.workflows && Array.isArray(task.workflows)) {
                      modelName = task.workflows[0]?.title || modelName;
                    } else if (task.workflows && typeof task.workflows === 'object') {
                      modelName = task.workflows.title || modelName;
                    }

                    return (
                      <div key={task.id} className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 flex flex-col group relative">

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-danger-red text-white p-1.5 rounded-full z-20 transition-colors"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>

                        {isSuccess && task.result_video_url ? (
                          <div className="relative w-full aspect-video bg-black flex-shrink-0 border-b border-white/10">
                            {isImageUrl(task.result_video_url) ? (
                              <img src={task.result_video_url} alt="Result" className="w-full h-full object-cover" />
                            ) : (
                              <video src={task.result_video_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                            )}

                            {/* Hover overlay for actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <a href={task.result_video_url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white hover:text-black rounded-full backdrop-blur transition-all">
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        ) : null}

                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-white truncate max-w-[120px]">{modelName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isSuccess ? 'bg-primary-green/20 text-primary-green' :
                              isFailed ? 'bg-danger-red/20 text-danger-red' :
                              'bg-yellow-500/20 text-yellow-500 animate-pulse'
                            }`}>
                              {isSuccess ? '已完成' : isFailed ? '失败' : '生成中'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-mono truncate max-w-[100px]">{task.id}</span>
                            <span className="text-[10px] text-gray-500">{new Date(task.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}