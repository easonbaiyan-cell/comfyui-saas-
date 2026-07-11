'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Workflow } from '@prisma/client';

export default function ClientExecutionConsole({ workflow }: { workflow: Workflow }) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock config parsing (in a real app, this parses workflow.config JSON)
  const formFields = workflow.config ? JSON.parse(JSON.stringify(workflow.config)) : [
    { name: 'prompt', label: '正向提示词 (Prompt)', type: 'textarea', placeholder: '描述你想要生成的画面...' },
    { name: 'seed', label: '随机种子 (Seed)', type: 'number', placeholder: '-1 (随机)' }
  ];

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    setStatus('RUNNING');
    setProgress(5);
    setErrorMsg(null);
    setResultImage(null);

    try {
      const execRes = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });
      const execData = await execRes.json();

      if (!execRes.ok) {
        throw new Error(execData.error || 'Failed to start execution');
      }

      const taskId = execData.task.id;
      
      // Poll for status
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/tasks/${taskId}/status`);
          const statusData = await statusRes.json();
          
          if (statusRes.ok && statusData.task) {
            setProgress(statusData.task.progress);
            if (statusData.task.status === 'SUCCESS') {
              clearInterval(poll);
              setStatus('SUCCESS');
              setProgress(100);
              // Extract mock output image
              if (statusData.task.outputs?.images?.[0]?.url) {
                setResultImage(statusData.task.outputs.images[0].url);
              } else {
                setResultImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'); // Fallback mock success image
              }
            } else if (statusData.task.status === 'FAILED') {
              clearInterval(poll);
              setStatus('FAILED');
              setErrorMsg(statusData.task.errorMessage || 'Execution failed');
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

    } catch (err: any) {
      setStatus('FAILED');
      setErrorMsg(err.message);
      setProgress(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel: Dynamic Form */}
      <div className="lg:col-span-1 space-y-6 bg-card border rounded-lg p-6">
        <h3 className="font-semibold text-lg border-b pb-4">输入参数</h3>
        
        <div className="space-y-4">
          {formFields.map((field: any) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea 
                  id={field.name} 
                  placeholder={field.placeholder} 
                  rows={4}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              ) : (
                <Input 
                  id={field.name} 
                  type={field.type === 'number' ? 'number' : 'text'} 
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-6" 
          size="lg" 
          onClick={handleExecute}
          disabled={status === 'RUNNING'}
        >
          {status === 'RUNNING' ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5 fill-current" />
              立即生成 ({workflow.platformCost} 积分)
            </>
          )}
        </Button>

        {errorMsg && (
          <div className="p-3 mt-4 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded flex items-start">
             <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
             {errorMsg}
          </div>
        )}
      </div>

      {/* Right Panel: Execution Console & Result Gallery */}
      <div className="lg:col-span-2 bg-card border rounded-lg p-6 flex flex-col min-h-[500px]">
        <h3 className="font-semibold text-lg border-b pb-4 mb-6">执行结果</h3>
        
        {status === 'IDLE' && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Play className="w-8 h-8 opacity-50 ml-1" />
            </div>
            <p>调整左侧参数并点击“立即生成”开始</p>
          </div>
        )}

        {status === 'RUNNING' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="w-full max-w-md space-y-2 text-center">
              <p className="text-sm font-medium">AI 正在努力生成中...</p>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && resultImage && (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center text-green-500 mb-4 bg-green-500/10 px-3 py-2 rounded w-fit border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="font-medium">生成成功</span>
            </div>
            <div className="relative rounded-lg overflow-hidden border bg-black/5 flex-1 flex items-center justify-center group">
              <img 
                src={resultImage} 
                alt="Generated Result" 
                className="max-w-full max-h-[600px] object-contain shadow-2xl" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Button variant="secondary" size="lg">下载原图</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
