"use client";

import { Copy, Calendar, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function BillingPage() {
  const router = useRouter();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("全部状态");
  const statuses = ["全部状态", "成功", "运行中", "失败"];

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
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

        if (error) {
          console.error("Error fetching tasks:", error);
        } else {
          setTasks(data || []);
        }
      } catch (err) {
        console.error("Fetch exception:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  // Calculate summary stats
  const totalTasks = tasks.length;
  const totalPoints = tasks.reduce((sum, task) => sum + (task.cost_points || 0), 0);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).catch(console.error);
    // Could add a toast here
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedStatus === "全部状态") return true;

    let taskStatusStr = "失败";
    if (task.status === "success" || task.result_video_url) {
      taskStatusStr = "成功";
    } else if (task.status === "processing" || task.status === "running") {
      taskStatusStr = "运行中";
    }

    return taskStatusStr === selectedStatus;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 md:p-12">
      <div className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-[#1C1C1E] rounded-2xl p-6 sm:p-10">
        <button onClick={() => router.back()} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50">
          <X className="w-6 h-6" />
        </button>
    <div className="flex flex-col bg-transparent font-sans tracking-wide">

      <main className="flex-1 container mx-auto max-w-6xl">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">积分与账单</h1>
          <p className="text-gray-400">查看您的任务历史与积分消耗明细</p>
        </div>

        {/* Summary Bar */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-8 mb-8 text-xs text-gray-400 font-medium">
          <span>共 {totalTasks} 条记录</span>
          <span>计费时长合计 -</span>
          <span>积分消耗合计 {totalPoints}</span>
        </div>

        {/* Filters Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center justify-between gap-2 bg-[#111111] border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-lg text-sm text-gray-300 w-40 transition-colors"
            >
              {selectedStatus}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isStatusOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsStatusOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      selectedStatus === status ? "text-white bg-white/5" : "text-gray-400"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">日期范围 默认展示最新任务...</span>
            <div className="flex items-center gap-2 bg-[#111111] border border-white/10 px-4 py-2.5 rounded-lg text-sm text-gray-300">
              <span>全量数据</span>
              <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1a1a1a]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">任务ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">发起时间</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">任务名称</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">状态</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">时长</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">消耗积分</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      暂无账单记录
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isSuccess = task.status === 'success' || !!task.result_video_url;
                    const isProcessing = task.status === 'processing' || task.status === 'running';

                    let statusColor = "bg-danger-red";
                    let statusText = "失败";
                    if (isSuccess) {
                      statusColor = "bg-primary-green";
                      statusText = "成功";
                    } else if (isProcessing) {
                      statusColor = "bg-yellow-500";
                      statusText = "运行中";
                    }

                    const workflowName = task.workflow_id ? `工作流 ${task.workflow_id.substring(0, 8)}` : "AI 视频生成";

                    return (
                      <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {task.id.substring(0, 8)}
                            <button
                              onClick={() => handleCopyId(task.id)}
                              className="text-gray-600 hover:text-white transition-colors"
                              title="复制完整ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          {new Date(task.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {task.workflow_id ? (
                            <button
                              onClick={() => router.push('/workflow/' + task.workflow_id)}
                              className="text-gray-300 underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white transition-all cursor-pointer"
                            >
                              {workflowName}
                            </button>
                          ) : (
                            <span className="text-gray-300">{workflowName}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                            <span className="text-gray-300">{statusText}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                          -
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-medium whitespace-nowrap">
                          {task.cost_points ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {task.workflow_id && (
                            <button
                              onClick={() => router.push('/workflow/' + task.workflow_id)}
                              className="text-primary-green hover:text-primary-green text-sm font-medium transition-colors hover:scale-105 transform"
                            >
                              再次生成
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
      </div>
    </div>
  );
}
