"use client";

import { Header } from "@/components/Header";
import { Copy, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

const mockTasks = [
  {
    id: "9823749812739812",
    startTime: "2026-07-09 14:28:42",
    name: "赛博朋克城市漫游",
    status: "成功",
    duration: "01:35",
    points: 38,
  },
  {
    id: "9823749812739813",
    startTime: "2026-07-09 13:15:00",
    name: "未来太空站内部景观",
    status: "运行中",
    duration: "00:45",
    points: 15,
  },
  {
    id: "9823749812739814",
    startTime: "2026-07-09 12:00:22",
    name: "复古机械键盘特写",
    status: "排队中",
    duration: "--:--",
    points: 10,
  },
  {
    id: "9823749812739815",
    startTime: "2026-07-08 22:45:11",
    name: "自然风景延时摄影",
    status: "失败",
    duration: "00:12",
    points: 0,
  },
  {
    id: "9823749812739816",
    startTime: "2026-07-08 19:30:05",
    name: "二次元少女角色设定",
    status: "已取消",
    duration: "00:00",
    points: 0,
  },
  {
    id: "9823749812739817",
    startTime: "2026-07-07 09:12:33",
    name: "产品发布会宣传片",
    status: "成功",
    duration: "02:10",
    points: 55,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "成功":
      return "bg-primary-green";
    case "运行中":
      return "bg-primary-green";
    case "排队中":
      return "bg-primary-green";
    case "失败":
      return "bg-danger-red";
    case "已取消":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export default function BillingPage() {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("全部状态");
  const statuses = ["全部状态", "成功", "运行中", "排队中", "失败", "已取消"];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] font-sans tracking-wide">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">积分与账单</h1>
          <p className="text-gray-400">查看您的任务历史与积分消耗明细</p>
        </div>

        {/* Summary Bar */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-8 mb-8 text-xs text-gray-400 font-medium">
          <span>共 128 条记录</span>
          <span>计费时长合计 12:34:56</span>
          <span>积分消耗合计 4580</span>
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
              <span>2026-06-09 至 2026-07-09</span>
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
                {mockTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {task.id}
                        <button className="text-gray-600 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {task.startTime}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button className="text-gray-300 underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white transition-all cursor-pointer">
                        {task.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(task.status)}`} />
                        <span className="text-gray-300">{task.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {task.duration}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-medium whitespace-nowrap">
                      {task.points}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-primary-green hover:text-primary-green text-sm font-medium transition-colors hover:scale-105 transform">
                        再次生成
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
