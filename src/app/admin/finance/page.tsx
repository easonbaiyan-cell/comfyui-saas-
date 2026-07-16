'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getFinanceDashboardDataAction } from './actions';
import { Commission } from '@/types/database.types';

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRechargeAmount: 0,
    totalCommissionAmount: 0,
    totalOrderCount: 0,
  });
  const [commissions, setCommissions] = useState<Partial<Commission>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const result = await getFinanceDashboardDataAction(session.access_token);
          if (result.success && result.metrics) {
            setMetrics(result.metrics);
            setCommissions(result.commissionsList || []);
          } else {
            setError(result.error || 'Failed to load data');
          }
        } else {
            setError('No active session found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">加载失败: {error}</div>;
  }

  return (
    <div className="p-8">
      {/* Header section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">财务与分销</h2>
        <p className="text-gray-500 mt-1">查看平台充值订单与分销佣金数据。已自动隔离隐私账单数据。</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">全站总充值金额</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">¥ {metrics.totalRechargeAmount.toFixed(2)}</dd>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">全站发放佣金总额</dt>
          <dd className="mt-2 text-3xl font-semibold text-green-600">¥ {metrics.totalCommissionAmount.toFixed(2)}</dd>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">总订单数</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalOrderCount}</dd>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">分销账单明细</h3>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      邀请人 ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受邀人 ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      下级充值额
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上级获得分成
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">暂无分销记录</td>
                    </tr>
                  ) : commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                        {comm.inviter_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                        {comm.invitee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥ {Number(comm.order_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ¥ {Number(comm.commission_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(comm.created_at || '').toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
