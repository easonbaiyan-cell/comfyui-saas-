"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

type Creation = {
  id: string;
  result_video_url: string;
  created_at: string;
  status?: string;
};

export default function WorkspacePage() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchCreations = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log("Workspace Data fetched:", data, error);

      if (error) throw error;

      if (data) {
        const formattedData: Creation[] = data.map((item: any) => {
           return {
             id: item.id,
             result_video_url: item.result_video_url || "",
             created_at: item.created_at,
             status: item.status
           };
        });

        setCreations(formattedData);
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('video_tasks').delete().eq('id', id);
      if (error) {
        console.error("Failed to delete creation:", error);
        return;
      }
      setCreations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    fetchCreations();
  }, [user?.id]);

  const isImageUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');
  };

  // 在 render 阶段，强行互斥
  if (isLoading) return <div className="p-10 text-white">加载中...</div>;
  if (!creations || creations.length === 0) return <EmptyState />;
  // 只要代码走到这里，说明绝对有数据，屏幕上绝对不允许再出现 EmptyState 的 DOM！

  return (
    <div className="w-full relative z-10 p-6 bg-[#0B0F19] min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((item) => (
          <div key={item.id} className="relative flex flex-col rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg block">
             {/* 严禁使用 absolute 强行定位图片，必须使用普通流布局 */}
             {item.result_video_url ? (
                <img src={item.result_video_url} alt="result" className="w-full h-auto aspect-video object-cover relative z-20" />
             ) : (
                <div className="w-full aspect-video bg-gray-900 flex items-center justify-center text-gray-500">解析中...</div>
             )}
             <div className="p-4">
                <p className="text-sm text-gray-400 truncate">Time: {new Date(item.created_at).toLocaleString()}</p>
             </div>
          </div>
        ))}
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
