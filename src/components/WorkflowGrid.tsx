"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";


interface Category {
  id: string;
  name: string;
  requiredTier: string;
}

interface Workflow {
  id: string;
  runninghubId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  referenceVideoUrl: string | null;
  virtualPlatform: string | null;
  virtualLikes: number | null;
  category: string | null;
  creditCost: number;
}


function formatLikes(likes: number | null): string {
  if (likes == null) return "0";
  if (likes >= 10000) {
    return (likes / 10000).toFixed(1) + 'w';
  }
  return likes.toString();
}

function VideoCard({ workflow }: { workflow: Workflow }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link href={`/workflow/${workflow.id}`} className="block w-full">
      <div
        className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-[#111]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={workflow.referenceVideoUrl || ""}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          poster={workflow.coverImageUrl || undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
          <h3 className="text-white text-sm font-medium truncate mb-1">
            {workflow.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            {workflow.virtualPlatform && (
              <span className="bg-danger-red/80 text-white text-[10px] px-1.5 py-0.5 rounded mr-2">
                {workflow.virtualPlatform}
              </span>
            )}
            <span>🤍 {formatLikes(workflow.virtualLikes)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function WorkflowGrid({ workflows, categories }: { workflows: Workflow[], categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].name : "");

  const filteredWorkflows = activeCategory
    ? workflows.filter(w => w.category === activeCategory)
    : workflows;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Category Navigation */}
      <div className="flex w-full overflow-x-auto no-scrollbar gap-6 border-b border-white/5 pb-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative cursor-pointer py-2 group flex-shrink-0"
            onClick={() => setActiveCategory(cat.name)}
          >
            <div className="flex items-center gap-1">
              <span className={`text-base font-medium transition-colors ${
                activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`}>
                {cat.name}
              </span>
              {cat.requiredTier !== "free" && (
                <div className="relative flex items-center">
                  <Lock className={`w-4 h-4 transition-colors ${
                    activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="absolute -top-3 -right-11 text-[8px] bg-gradient-to-r from-pink-400 to-yellow-300 text-black font-medium px-1 py-[1px] rounded-t-full rounded-br-full rounded-bl-none whitespace-nowrap">
                    包年专享
                  </span>
                </div>
              )}
            </div>

            {/* Active Indicator */}
            {activeCategory === cat.name && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-primary-green" />
            )}
          </div>
        ))}
      </div>

      {/* Grid Layout */}
      {!filteredWorkflows.length ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-muted-foreground mt-4">
          <p>暂无可用工作流。</p>
          <p className="text-sm">请稍后再来看看，或在后台进行配置。</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
          {filteredWorkflows.map((workflow) => (
            <VideoCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}
