"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Download, Trash2, ArrowRight } from "lucide-react";

// Mock data
const mockCreations = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/600/800?random=1",
    createdAt: "2024-05-18 14:23",
    modelName: "FLUX.1 Pro Generator",
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/600/800?random=2",
    createdAt: "2024-05-17 09:12",
    modelName: "Video Upscaler 4K",
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/600/800?random=3",
    createdAt: "2024-05-15 18:45",
    modelName: "FLUX.1 Pro Generator",
  },
  {
    id: "4",
    imageUrl: "https://picsum.photos/600/800?random=4",
    createdAt: "2024-05-12 11:30",
    modelName: "Portrait Enhancer",
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/600/800?random=5",
    createdAt: "2024-05-10 16:20",
    modelName: "Anime Style Gen",
  },
];

export default function WorkspacePage() {
  const [creations, setCreations] = useState<typeof mockCreations>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder for fetching creations
  const fetchCreations = async () => {
    // Simulate API call
    setTimeout(() => {
      setCreations(mockCreations);
      setIsLoading(false);
    }, 500);
  };

  // Placeholder for deleting a creation
  const handleDelete = (id: string) => {
    setCreations((prev) => prev.filter((item) => item.id !== id));
    // Here you would also call Supabase to delete the item
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <Header />

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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-primary-green rounded-full"></div>
              <div className="h-2 w-2 bg-primary-green rounded-full animation-delay-200"></div>
              <div className="h-2 w-2 bg-primary-green rounded-full animation-delay-400"></div>
            </div>
          </div>
        ) : creations.length > 0 ? (
          /* Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {creations.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a] transition-all hover:border-white/20"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.modelName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />

                {/* Default Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="text-xs text-gray-300 font-medium truncate mb-1">
                    {item.modelName}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {item.createdAt}
                  </div>
                </div>

                {/* Hover Mask & Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end p-3">
                  <div className="flex flex-col gap-2">
                    <button
                      className="p-2 bg-white/10 hover:bg-primary-green text-white hover:text-black rounded-full backdrop-blur-md transition-colors"
                      title="下载"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white/10 hover:bg-danger-red text-white rounded-full backdrop-blur-md transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
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
              href="/#workflows"
              className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              立即生成
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
