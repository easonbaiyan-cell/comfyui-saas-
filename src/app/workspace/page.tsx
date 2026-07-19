"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ArrowRight, X, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";


const isImageUrl = (url: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');
};

const handleDownload = async (e: React.MouseEvent, url: string, filename: string = 'creation.png') => {
  e.stopPropagation(); // 必须阻止冒泡，防止触发外层的放大预览
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('下载失败，尝试在新窗口打开:', error);
    window.open(url, '_blank'); // 兜底方案
  }
};

export default function WorkspacePage() {
  const [videoTasks, setVideoTasks] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;

    // Optimistic UI update
    setVideoTasks(prev => prev.filter(t => !selectedIds.includes(t.id)));

    const { error } = await supabase
      .from('video_tasks')
      .delete()
      .in('id', selectedIds);

    if (error) {
      console.error("Delete failed", error);
      // Optional: Refetch or revert state here if needed
    } else {
      setSelectedIds([]);
      setIsManaging(false);
    }
  };

  const handleBatchDownload = () => {
    if (!selectedIds.length) return;

    selectedIds.forEach(id => {
      const task = videoTasks.find(t => t.id === id);
      if (task && task.result_video_url) {
        // Create an invisible anchor to trigger download
        const a = document.createElement('a');
        a.href = task.result_video_url;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });

    setSelectedIds([]);
    setIsManaging(false);
  };


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

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">我的创作</h1>
        <button
          onClick={() => {
            setIsManaging(!isManaging);
            if (isManaging) setSelectedIds([]);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isManaging ? 'bg-white text-black hover:bg-gray-200' : 'bg-primary-green text-black hover:bg-primary-green/90'
          }`}
        >
          {isManaging ? '完成' : '管理'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
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
            <div key={task.id} className="relative flex flex-col rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 group aspect-[9/16] cursor-pointer" onClick={() => {
              if (isManaging) {
                setSelectedIds(prev => prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]);
              } else if (isSuccess && task.result_video_url) {
                setPreviewItem(task.result_video_url);
              }
            }}>

               {/* Selection Indicator */}
               {isManaging && (
                 <div className="absolute top-2 right-2 z-20">
                   {selectedIds.includes(task.id) ? (
                     <CheckCircle2 className="w-6 h-6 text-primary-green fill-white/10" />
                   ) : (
                     <Circle className="w-6 h-6 text-white/50" />
                   )}
                 </div>
               )}

               {isSuccess && task.result_video_url ? (
                  <div className="relative w-full h-full bg-black flex-shrink-0">
                    {isImageUrl(task.result_video_url) ? (
                      <img src={task.result_video_url} alt="Result" className="w-full h-full object-cover" />
                    ) : (
                      <video src={task.result_video_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    )}

                  </div>
               ) : (
                  <div className="w-full h-full bg-black flex-shrink-0 flex items-center justify-center text-gray-500">
                    {isFailed ? '生成失败' : '生成中...'}
                  </div>
               )}
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white truncate max-w-[150px]">{modelName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSuccess ? 'bg-primary-green/20 text-primary-green' :
                        isFailed ? 'bg-danger-red/20 text-danger-red' :
                        'bg-yellow-500/20 text-yellow-500 animate-pulse'
                      }`}>
                        {isSuccess ? '已完成' : isFailed ? '失败' : '生成中'}
                      </span>
                      {isSuccess && task.result_video_url && (
                        <button
                          onClick={(e) => handleDownload(e, task.result_video_url)}
                          className="pointer-events-auto text-white hover:text-white/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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


      {/* Management Action Bar */}
      {isManaging && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl backdrop-blur-md">
          <span className="text-sm text-gray-400">已选 {selectedIds.length} 项</span>

          <div className="w-px h-4 bg-white/10"></div>

          <button
            onClick={() => {
              setIsManaging(false);
              setSelectedIds([]);
            }}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            取消
          </button>

          <button
            onClick={() => {
              if (selectedIds.length === videoTasks.length) {
                setSelectedIds([]);
              } else {
                setSelectedIds(videoTasks.map(t => t.id));
              }
            }}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            全选
          </button>

          <button
            onClick={handleBatchDownload}
            disabled={selectedIds.length === 0}
            className="text-sm text-white hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            下载
          </button>

          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
            className="text-sm text-danger-red hover:text-danger-red/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            删除
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewItem(null)}>
          <button onClick={() => setPreviewItem(null)} className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-50">
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isImageUrl(previewItem) ? (
              <img src={previewItem} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video src={previewItem} className="w-full h-full object-contain" autoPlay muted loop controls />
            )}
          </div>
        </div>
      )}
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
