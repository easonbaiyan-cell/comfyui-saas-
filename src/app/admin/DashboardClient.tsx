'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Activity, Users, CreditCard, Zap, Server, CheckCircle2 } from 'lucide-react';
import { getDashboardDataAction } from './actions';
import { supabase } from '@/lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  newUsersCount: number;
  todayRevenue: number;
  todayTasksCount: number;
  totalPointsConsumed: number;
  runningTasksCount: number;
  taskSuccessRate: number;
  trendData: { date: string; tasks: number; points: number }[];
  topWorkflows: { id: string; title: string; category: string; usage_count: number; r_app_id: string }[];
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          return;
        }

        const response = await getDashboardDataAction(session.access_token);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch dashboard data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg text-gray-500 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg text-red-500">Error: {error || 'Failed to load data'}</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">数据大盘 (Dashboard)</h2>
        <p className="text-gray-500 mt-2">实时监控平台运营、财务与算力消耗核心指标。</p>
      </div>

      {/* Top Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">今日新增用户</CardTitle>
            <Users className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.newUsersCount}</div>
            <p className="text-xs text-green-600 font-medium mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">今日总营收 (元)</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">¥{data.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 font-medium mt-1">+8% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">今日任务数</CardTitle>
            <Activity className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.todayTasksCount}</div>
            <p className="text-xs text-green-600 font-medium mt-1">+23% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-100">总消耗积分</CardTitle>
            <Zap className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalPointsConsumed.toLocaleString()}</div>
            <p className="text-xs text-gray-100 mt-1">Total points burned</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Chart & System Health */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-5">
          <CardHeader>
            <CardTitle className="text-white">近7天算力消耗趋势</CardTitle>
            <CardDescription className="text-gray-300">任务生成量 (蓝) 与积分消耗 (绿)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#f3f4f6" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#f3f4f6" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f3f4f6" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="tasks" stroke="#6366f1" fillOpacity={1} fill="url(#colorTasks)" name="任务数" />
                  <Area yAxisId="right" type="monotone" dataKey="points" stroke="#10b981" fillOpacity={1} fill="url(#colorPoints)" name="积分消耗" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-white">系统健康度</CardTitle>
            <CardDescription className="text-gray-300">当前算力池与任务执行状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <Server className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-white">执行中任务</p>
                <p className="text-2xl font-bold text-white">{data.runningTasksCount}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-white">整体任务成功率</span>
                </div>
                <span className="text-sm font-bold text-white">{data.taskSuccessRate}%</span>
              </div>
              <Progress value={data.taskSuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">热门工作流 Top 5</CardTitle>
          <CardDescription className="text-gray-300">按全平台历史总调用次数排序</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-gray-100">排名</TableHead>
                <TableHead className="text-gray-100">工作流名称</TableHead>
                <TableHead className="text-gray-100">分类</TableHead>
                <TableHead className="text-gray-100">R端应用ID</TableHead>
                <TableHead className="text-right text-gray-100">总调用次数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topWorkflows.map((workflow, index) => (
                <TableRow key={workflow.id || index}>
                  <TableCell className="font-medium">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-white">{workflow.title}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {workflow.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-100">{workflow.r_app_id}</TableCell>
                  <TableCell className="text-right font-bold text-white">
                    {workflow.usage_count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
