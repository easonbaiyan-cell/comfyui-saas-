import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Workflow, User, Order } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch some summary stats
  let workflows: Workflow[] = [];
  let users: User[] = [];
  let recentOrders: Order[] = [];

  try {
    workflows = await prisma.workflow.findMany({ orderBy: { createdAt: 'desc' } });
    users = await prisma.user.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
    recentOrders = await prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: true } });
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }

  // Fallbacks if db empty for visualization
  if (workflows.length === 0) {
      workflows = [
          { id: 'w1', title: 'Midjourney动漫化', runningHubId: 'rh-123', platformCost: 15, baseCreditCost: 10, createdAt: new Date() } as any
      ];
      users = [
          { id: 'u1', phone: '13800138000', balance: 1500, createdAt: new Date() } as any
      ];
      recentOrders = [
          { id: 'o1', userId: 'u1', amount: 50, credits: 1000, status: 'PAID', paymentMethod: 'WECHAT_PAY', createdAt: new Date(), user: { phone: '13800138000' } } as any
      ];
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理后台 (Admin)</h1>
        <p className="text-muted-foreground mt-2">
          管理工作流节点、监控用户消耗及充值订单。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">上架工作流</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">近期订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">工作流管理</TabsTrigger>
          <TabsTrigger value="users">用户列表</TabsTrigger>
          <TabsTrigger value="orders">充值订单 (Webhooks)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>已配置工作流</CardTitle>
              <CardDescription>管理 RunningHub 的映射与定价规则（1.5x）。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>RunningHub ID</TableHead>
                    <TableHead>成本价</TableHead>
                    <TableHead>平台定价</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell className="font-medium">{wf.title}</TableCell>
                      <TableCell className="font-mono text-xs">{wf.runningHubId}</TableCell>
                      <TableCell>{wf.baseCreditCost}</TableCell>
                      <TableCell className="text-primary font-bold">{wf.platformCost}</TableCell>
                      <TableCell>{wf.createdAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户资产</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>手机号</TableHead>
                    <TableHead>当前积分余额</TableHead>
                    <TableHead>注册时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.phone}</TableCell>
                      <TableCell>{u.balance}</TableCell>
                      <TableCell>{u.createdAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>充值记录</CardTitle>
              <CardDescription>由微信支付/支付宝 Webhook 回调更新。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户手机</TableHead>
                    <TableHead>充值金额(CNY)</TableHead>
                    <TableHead>获得积分</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell>{o.user?.phone}</TableCell>
                      <TableCell>¥{o.amount}</TableCell>
                      <TableCell className="text-primary">+{o.credits}</TableCell>
                      <TableCell>{o.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant={o.status === 'PAID' ? 'default' : 'secondary'}>
                          {o.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
