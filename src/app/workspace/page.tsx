"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function WorkspacePage() {
  const [videoTasks, setVideoTasks] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user) {
      // initial fetch
      const fetchTasks = async () => {
        const { data } = await supabase
          .from('video_tasks')
          .select('*, workflows(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setVideoTasks(data);
        setIsLoading(false);
      };

      fetchTasks();

      interval = setInterval(fetchTasks, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // 在 render 阶段，强行互斥
  if (isLoading) return <div className="p-10 text-white">加载中...</div>;
  if (!videoTasks || videoTasks.length === 0) return <EmptyState />;
  // 只要代码走到这里，说明绝对有数据，屏幕上绝对不允许再出现 EmptyState 的 DOM！

  return (
    <div className="w-full relative z-10 p-6 bg-[#0B0F19] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoTasks.map((task) => {
          const isSuccess = !!task.result_video_url || task.status === 'success';
          const isFailed = task.status === 'failed';
          let modelName = 'Unknown Workflow';
          if (task.workflows && Array.isArray(task.workflows)) {
            modelName = task.workflows[0]?.title || modelName;
          } else if (task.workflows && typeof task.workflows === 'object') {
            modelName = task.workflows.title || modelName;
          }

          return (
            <div key={task.id} className="relative flex flex-col rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 group">
               {isSuccess && task.result_video_url ? (
                  <div className="relative w-full aspect-video bg-black flex-shrink-0 border-b border-white/10">
                    <img src={task.result_video_url} alt="Result" className="w-full h-full object-cover" />

                    {/* Hover overlay for actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <a href={task.result_video_url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white hover:text-black rounded-full backdrop-blur transition-all">
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
               ) : (
                  <div className="w-full aspect-video bg-black flex-shrink-0 border-b border-white/10 flex items-center justify-center text-gray-500">
                    {isFailed ? '生成失败' : '生成中...'}
                  </div>
               )}
               <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white truncate max-w-[150px]">{modelName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isSuccess ? 'bg-primary-green/20 text-primary-green' :
                      isFailed ? 'bg-danger-red/20 text-danger-red' :
                      'bg-yellow-500/20 text-yellow-500 animate-pulse'
                    }`}>
                      {isSuccess ? '已完成' : isFailed ? '失败' : '生成中'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{task.id}</span>
                    <span className="text-[10px] text-gray-500">{new Date(task.created_at).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-white">
    <div className="w-24 h-24 mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
      <Image
        src="/favicon.ico"
        alt="Empty"
        width={32}
        height={32}
        className="opacity-20 grayscale"
      />
    </div>
    <h3 className="text-xl font-medium mb-2">暂无创作</h3>
    <p className="text-gray-400 mb-8 max-w-sm">
      暂无创作，去释放你的灵感吧
    </p>
    <Link
      href="/"
      className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green text-black px-6 py-3 rounded-full font-medium transition-colors"
    >
      立即生成
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);
