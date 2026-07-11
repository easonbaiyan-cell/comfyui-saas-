import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Workflow } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  let workflows: Workflow[] = [];
  try {
    workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
  }

  // Mock data if DB is empty (useful for initial visualization)
  if (workflows.length === 0) {
    workflows = [
      {
        id: 'mock-1',
        title: 'Midjourney 风格动漫化',
        description: '将输入的人物照片转换为高质量的日系动漫风格，保持原图特征。',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
        category: '图像风格化',
        platformCost: 15,
        runningHubId: 'rh-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        baseCreditCost: 10,
        config: null
      },
      {
        id: 'mock-2',
        title: '电商产品白底图替换',
        description: '自动识别商品主体，一键替换为高级感纯色或真实场景背景。',
        coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        category: '电商工具',
        platformCost: 8,
        runningHubId: 'rh-124',
        createdAt: new Date(),
        updatedAt: new Date(),
        baseCreditCost: 5,
        config: null
      },
      {
        id: 'mock-3',
        title: '老照片高清修复',
        description: '利用 AI 技术修复模糊、破损的老照片，提升人脸细节和整体清晰度。',
        coverImage: 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=500&q=80',
        category: '图像修复',
        platformCost: 20,
        runningHubId: 'rh-125',
        createdAt: new Date(),
        updatedAt: new Date(),
        baseCreditCost: 13,
        config: null
      }
    ];
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">探索工作流</h1>
        <p className="text-muted-foreground mt-2">
          发现并执行基于 ComfyUI 驱动的高质量 AI 生成方案。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="group overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/50">
            <div className="aspect-video w-full overflow-hidden bg-muted relative">
              {workflow.coverImage ? (
                <img
                  src={workflow.coverImage}
                  alt={workflow.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  暂无封面
                </div>
              )}
              {workflow.category && (
                <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
                  {workflow.category}
                </Badge>
              )}
            </div>
            
            <CardHeader className="p-4 flex-1">
              <CardTitle className="line-clamp-1 text-lg">{workflow.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {workflow.description || '暂无描述。'}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-primary">{workflow.platformCost}</span>
                <span className="text-xs text-muted-foreground">积分/次</span>
              </div>
              <Link href={`/workflows/${workflow.id}`}>
                <Button size="sm" className="gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  运行
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
