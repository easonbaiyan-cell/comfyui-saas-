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
  createdAt: string;
  modelName: string;
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
        .select('*, workflows(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: Creation[] = data.map((item: any) => {
           let modelName = 'Unknown Workflow';
           if (item.workflows && Array.isArray(item.workflows)) {
             modelName = item.workflows[0]?.title || modelName;
           } else if (item.workflows && typeof item.workflows === 'object') {
             modelName = item.workflows.title || modelName;
           }

           return {
             id: item.id,
             result_video_url: item.result_video_url || "",
             createdAt: new Date(item.created_at).toLocaleString(),
             modelName: modelName,
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

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            我的创作
          </h1>
          <div className="text-sm text-gray-400">
            共 {creations.length} 个作品
          </div>
        </div>

        {/* Content Section */}
        {creations && creations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creations.map((item) => (
              <div key={item.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a] transition-all hover:border-white/20 flex flex-col items-center justify-center">
                 {/* 必须强制使用 result_video_url */}
                 {isImageUrl(item.result_video_url) ? (
                    <img src={item.result_video_url} alt="Result" className="w-full h-full object-cover" />
                 ) : (
                    <video src={item.result_video_url} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                 )}
                 <p className="absolute bottom-4 left-4 z-20 text-white font-bold bg-black/50 px-2 py-1 rounded">Workflow: {item.modelName}</p>
                 <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-danger-red text-white rounded-full backdrop-blur-md transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
              <Image
                src="/favicon.ico"
                alt="Empty"
                width={32}
                height={32}
                className="opacity-20 grayscale"
              />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">暂无创作</h3>
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
          </div> // 只有在彻底没数据时才显示这个
        )}
      </main>
    </div>
  );
}
