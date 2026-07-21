'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getFinanceDashboardDataAction,
  getAffiliateRulesAction,
  saveAffiliateRuleAction,
  deleteAffiliateRuleAction,
  bindRelationshipAction,
  unbindRelationshipAction,
  updateCommissionAmountAction,
  revokeCommissionAction
} from './actions';
import { Commission, AffiliateRule } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRechargeAmount: 0,
    totalCommissionAmount: 0,
    totalOrderCount: 0,
  });
  const [commissions, setCommissions] = useState<Partial<Commission>[]>([]);
  const [rules, setRules] = useState<AffiliateRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [inviterSearch, setInviterSearch] = useState('');
  const [inviteeSearch, setInviteeSearch] = useState('');

  const [sessionToken, setSessionToken] = useState<string>('');

  // Rules Dialog State
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<AffiliateRule>>({});

  // Relationship Dialog State
  const [manualInviterId, setManualInviterId] = useState('');
  const [manualInviteeId, setManualInviteeId] = useState('');

  // Commission Edit State
  const [editCommissionOpen, setEditCommissionOpen] = useState(false);
  const [editingCommissionId, setEditingCommissionId] = useState('');
  const [newCommissionAmount, setNewCommissionAmount] = useState<number | ''>('');

  const fetchData = async (token: string) => {
    try {
      const [financeRes, rulesRes] = await Promise.all([
        getFinanceDashboardDataAction(token),
        getAffiliateRulesAction(token)
      ]);

      if (financeRes.success && financeRes.metrics) {
        setMetrics(financeRes.metrics);
        setCommissions(financeRes.commissionsList || []);
      } else {
        setError(financeRes.error || 'Failed to load finance data');
      }

      if (rulesRes.success && rulesRes.rules) {
        setRules(rulesRes.rules as AffiliateRule[]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionToken(session.access_token);
        await fetchData(session.access_token);
      } else {
        setError('No active session found.');
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSaveRule = async () => {
    if (!currentRule.min_invites || !currentRule.commission_rate) return;
    const res = await saveAffiliateRuleAction(sessionToken, currentRule);
    if (res.success) {
      setIsRuleDialogOpen(false);
      await fetchData(sessionToken);
    } else {
      alert(res.error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('确定删除此阶梯规则吗？')) return;
    const res = await deleteAffiliateRuleAction(sessionToken, id);
    if (res.success) {
      await fetchData(sessionToken);
    } else {
      alert(res.error);
    }
  };

  const handleBind = async () => {
    if (!manualInviterId || !manualInviteeId) return;
    const res = await bindRelationshipAction(sessionToken, manualInviterId, manualInviteeId);
    if (res.success) {
      alert('绑定成功');
      setManualInviterId('');
      setManualInviteeId('');
    } else {
      alert(res.error);
    }
  };

  const handleUnbind = async () => {
    if (!manualInviteeId) return alert('请输入受邀人 ID');
    if (!confirm('确定解除此用户的邀请关系吗？')) return;
    const res = await unbindRelationshipAction(sessionToken, manualInviteeId);
    if (res.success) {
      alert('解绑成功');
      setManualInviteeId('');
    } else {
      alert(res.error);
    }
  };

  const handleSaveCommissionAmount = async () => {
    if (newCommissionAmount === '' || !editingCommissionId) return;
    const res = await updateCommissionAmountAction(sessionToken, editingCommissionId, Number(newCommissionAmount));
    if (res.success) {
      setEditCommissionOpen(false);
      await fetchData(sessionToken);
    } else {
      alert(res.error);
    }
  };

  const handleRevokeCommission = async (id: string) => {
    if (!confirm('确定撤销此分润吗？（通常用于恶意退单）')) return;
    const res = await revokeCommissionAction(sessionToken, id);
    if (res.success) {
      await fetchData(sessionToken);
    } else {
      alert(res.error);
    }
  };

  const filteredCommissions = commissions.filter((comm) => {
    const matchInviter = !inviterSearch || (comm.inviter_id && comm.inviter_id.includes(inviterSearch));
    const matchInvitee = !inviteeSearch || (comm.invitee_id && comm.invitee_id.includes(inviteeSearch));
    return matchInviter && matchInvitee;
  });

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">加载失败: {error}</div>;

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">财务与分销中台</h2>
          <p className="text-muted-foreground mt-2">管理分销规则、干预关系链并查看分销账单明细。</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全站总充值金额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ {metrics.totalRechargeAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全站发放佣金总额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">¥ {metrics.totalCommissionAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrderCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Module 1: Affiliate Rules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>阶梯分销规则配置</CardTitle>
            <Button size="sm" onClick={() => { setCurrentRule({}); setIsRuleDialogOpen(true); }}>新增阶梯</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>邀请人数范围</TableHead>
                  <TableHead>返佣比例 (%)</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center">暂无规则</TableCell></TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        {rule.min_invites} - {rule.max_invites ? rule.max_invites : '无限'} 人
                      </TableCell>
                      <TableCell>{rule.commission_rate}%</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setCurrentRule(rule); setIsRuleDialogOpen(true); }}>编辑</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Module 3: Manual Override */}
        <Card>
          <CardHeader>
            <CardTitle>关系链人工干预</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>邀请人 ID (上级)</Label>
              <Input
                placeholder="输入邀请人 UUID"
                value={manualInviterId}
                onChange={(e) => setManualInviterId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>受邀人 ID (下级)</Label>
              <Input
                placeholder="输入受邀人 UUID"
                value={manualInviteeId}
                onChange={(e) => setManualInviteeId(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleBind} className="bg-primary">强制绑定</Button>
              <Button onClick={handleUnbind} variant="destructive">强制解绑</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module 2: Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>分销账单明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="搜索邀请人 ID"
              value={inviterSearch}
              onChange={(e) => setInviterSearch(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="搜索受邀人 ID"
              value={inviteeSearch}
              onChange={(e) => setInviteeSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号 / 时间</TableHead>
                <TableHead>邀请人 (上级)</TableHead>
                <TableHead>受邀人 (下级)</TableHead>
                <TableHead>下级充值额</TableHead>
                <TableHead>应用比例</TableHead>
                <TableHead>上级分成</TableHead>
                <TableHead>结算状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6">暂无分销记录</TableCell></TableRow>
              ) : (
                filteredCommissions.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="max-w-[200px]">
                      <div className="font-mono text-xs truncate">{comm.order_id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(comm.created_at || '').toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[100px] truncate" title={comm.inviter_id}>{comm.inviter_id}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[100px] truncate" title={comm.invitee_id}>{comm.invitee_id}</TableCell>
                    <TableCell>¥ {Number(comm.order_amount).toFixed(2)}</TableCell>
                    <TableCell>{comm.commission_rate ? `${comm.commission_rate}%` : '-'}</TableCell>
                    <TableCell className="font-medium text-green-600">¥ {Number(comm.commission_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {comm.status === 'revoked' ? (
                        <Badge variant="destructive">已撤销</Badge>
                      ) : comm.status === 'settled' ? (
                        <Badge variant="default" className="bg-green-500">已结算</Badge>
                      ) : (
                        <Badge variant="secondary">待结算</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={comm.status === 'revoked'}
                        onClick={() => {
                          setEditingCommissionId(comm.id!);
                          setNewCommissionAmount(comm.commission_amount!);
                          setEditCommissionOpen(true);
                        }}
                      >修改分成</Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={comm.status === 'revoked'}
                        onClick={() => handleRevokeCommission(comm.id!)}
                      >撤销</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentRule.id ? '编辑规则' : '新增阶梯规则'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">最小邀请人数</Label>
              <Input type="number" className="col-span-3" value={currentRule.min_invites || ''} onChange={(e) => setCurrentRule({...currentRule, min_invites: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">最大邀请人数</Label>
              <Input type="number" className="col-span-3" placeholder="留空代表无上限" value={currentRule.max_invites || ''} onChange={(e) => setCurrentRule({...currentRule, max_invites: e.target.value ? Number(e.target.value) : null})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">返佣比例 (%)</Label>
              <Input type="number" className="col-span-3" value={currentRule.commission_rate || ''} onChange={(e) => setCurrentRule({...currentRule, commission_rate: Number(e.target.value)})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveRule}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission Dialog */}
      <Dialog open={editCommissionOpen} onOpenChange={setEditCommissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动修改分成金额</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">新分成金额</Label>
              <Input
                type="number"
                className="col-span-3"
                value={newCommissionAmount}
                onChange={(e) => setNewCommissionAmount(e.target.value ? Number(e.target.value) : '')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCommissionOpen(false)}>取消</Button>
            <Button onClick={handleSaveCommissionAmount}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
