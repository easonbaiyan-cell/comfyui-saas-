import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import ClientExecutionConsole from './ClientExecutionConsole';

export const dynamic = 'force-dynamic';

export default async function WorkflowDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const workflowId = resolvedParams.id;

  let workflow = await prisma.workflow.findUnique({
    where: { id: workflowId }
  });

  // Fallback mock logic for UI building if DB record not found
  if (!workflow && workflowId.startsWith('mock-')) {
    workflow = {
        id: workflowId,
        title: 'Mock Workflow - Midjourney Style',
        description: 'This is a mock workflow description fallback when the database does not contain the specified ID.',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
        category: '图像风格化',
        platformCost: 15,
        runningHubId: 'rh-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        baseCreditCost: 10,
        config: null
      } as any;
  }

  if (!workflow) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-lg border">
        {workflow.coverImage && (
          <div className="w-full md:w-48 aspect-video rounded overflow-hidden shrink-0 border">
            <img 
              src={workflow.coverImage} 
              alt={workflow.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{workflow.title}</h1>
            {workflow.category && <Badge variant="secondary">{workflow.category}</Badge>}
          </div>
          <p className="text-muted-foreground">{workflow.description}</p>
          <div className="text-sm text-primary/80 pt-2 flex items-center">
            <span className="bg-primary/10 px-2 py-1 rounded font-mono">RunningHub ID: {workflow.runningHubId}</span>
          </div>
        </div>
      </div>

      {/* Main Execution Console Component */}
      <ClientExecutionConsole workflow={workflow} />
      
    </div>
  );
}
