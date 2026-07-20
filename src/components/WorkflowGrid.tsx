"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Lock, Video } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const TIER_MAP: Record<string, string> = {
  month: '包月',
  continuous_month: '连续包月',
  yearly: '包年'
};

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
        className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!workflow.referenceVideoUrl && !workflow.coverImageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Video className="w-10 h-10 text-gray-500" />
          </div>
        ) : !workflow.referenceVideoUrl && workflow.coverImageUrl ? (
          <img
            src={workflow.coverImageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt={workflow.title}
          />
        ) : (
          <video
            ref={videoRef}
            src={workflow.referenceVideoUrl || ""}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            poster={workflow.coverImageUrl || undefined}
          />
        )}
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
  const { user } = useAuthStore();
  const userTier = user?.user_metadata?.subscription_tier || "free";

  if (categories.length === 0) {
    categories = [
      { id: '1', name: '免费专区 (Mock)', requiredTier: 'free' },
      { id: '2', name: '包月专区 (Mock)', requiredTier: 'month' },
      { id: '3', name: '包年专区 (Mock)', requiredTier: 'yearly' },
    ];
  }

  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].name : "");

  const activeCategoryObj = categories.find(c => c.name === activeCategory);

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
            <div className="relative flex items-center gap-1 pr-2">
              <span className={`text-base font-medium transition-colors ${
                activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`}>
                {cat.name}
              </span>
              {cat.requiredTier && cat.requiredTier !== "free" && cat.requiredTier !== "免费" && (
                <>
                  <Lock className={`w-4 h-4 transition-colors ${
                    activeCategory === cat.name ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className={`absolute -top-4 -right-8 px-1.5 py-0.5 text-[10px] font-bold text-black whitespace-nowrap scale-90 rounded-t-full rounded-r-full rounded-bl-none ${cat.requiredTier === 'yearly' ? 'bg-gradient-to-r from-[#FF758C] to-[#FF7EB3]' : 'bg-gradient-to-r from-[#F9D423] to-[#8EFAEF]'}`}>
                    {TIER_MAP[cat.requiredTier] || cat.requiredTier}
                  </span>
                </>
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
      {activeCategoryObj?.requiredTier && activeCategoryObj.requiredTier !== "free" && activeCategoryObj.requiredTier !== "免费" && userTier === "free" ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-muted-foreground mt-4 gap-4 bg-[#1a1a1a]">
          <Lock className="w-12 h-12 text-gray-500 mb-2" />
          <div className="space-y-1">
            <p className="text-lg font-medium text-white">🔒 权限不足</p>
            <p className="text-sm">该分类为专属工作流，请升级会员后解锁体验。</p>
          </div>
          <Link
            href="/pricing"
            className="bg-primary-green text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-primary-green/90 transition-colors mt-2"
          >
            去升级 (Upgrade)
          </Link>
        </div>
      ) : !filteredWorkflows.length ? (
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
