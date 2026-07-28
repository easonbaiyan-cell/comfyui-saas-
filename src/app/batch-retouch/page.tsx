'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, UploadCloud, X, FileImage, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { WorkflowData } from '@/components/WorkflowGenerateBlock';


export interface TaskStatus {
  status: 'pending' | 'uploading' | 'generating' | 'success' | 'failed';
  resultUrl?: string;
  taskId?: string;
  error?: string;
}

export interface FileTask {
  id: string;
  file: File;
  previewUrl: string;
}

export default function BatchRetouchPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);

  const [images, setImages] = useState<FileTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

    const newTasks = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newTasks]);

    // Initialize status for new files
    const newStatuses: Record<string, TaskStatus> = {};
    newTasks.forEach(task => {
      newStatuses[task.id] = { status: 'pending' };
    });
    setTaskStatuses(prev => ({ ...prev, ...newStatuses }));

  };



  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(`batch-retouch/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  };

  const removeFile = (idToRemove: string) => {
    setImages(prev => prev.filter(task => {
      if (task.id === idToRemove) {
        URL.revokeObjectURL(task.previewUrl);
        return false;
      }
      return true;
    }));

    setTaskStatuses(prev => {
      const next = { ...prev };
      delete next[idToRemove];
      return next;
    });
  };




  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const pollStatus = async (taskId: string, imgId: string): Promise<string> => {
    while (true) {
      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        });

        if (!res.ok) throw new Error('Status API error');

        const data = await res.json();
        if (data.code === 0 && data.data) {
          const status = data.data.taskStatus;
          if (status === 'SUCCESS' || status === 'COMPLETED') {
            const url = data.data.taskResult?.fileUrl || data.data.taskResult?.fileUrls?.[0] || data.data.taskResult?.videoUrl;
            return url || '';
          } else if (status === 'FAILED' || status === 'TIMEOUT' || status === 'ERROR') {
            throw new Error(`Task failed: ${status}`);
          }
        }
      } catch (err: any) {
        console.error("Poll error:", err);
        // Continue polling unless it's a definitive error from the API body (handled above)
      }

      await sleep(3000); // Poll every 3 seconds
    }
  };

  const processSingleTask = async (task: FileTask, workflow: WorkflowData, token: string) => {
    try {
      // 1. Upload
      setTaskStatuses(prev => ({ ...prev, [task.id]: { ...prev[task.id], status: 'uploading' } }));
      const publicUrl = await uploadImageToSupabase(task.file);

      // 2. Generate Payload
      setTaskStatuses(prev => ({ ...prev, [task.id]: { ...prev[task.id], status: 'generating' } }));

      const payloadTemplate = workflow.rh_payload_template;
      if (!payloadTemplate || !payloadTemplate.nodeInfoList) {
        throw new Error('Invalid workflow configuration');
      }

      // Find the image node and update its value
      const constructedNodeInfoList = payloadTemplate.nodeInfoList.map((node: any) => {
        if (node.fieldName === 'image' || node.type === 'image') {
          return {
            nodeId: String(node.nodeId),
            fieldName: String(node.fieldName),
            fieldValue: publicUrl
          };
        }
        return {
          nodeId: String(node.nodeId),
          fieldName: String(node.fieldName || node.type || "text"),
          fieldValue: node.fieldValue !== undefined ? node.fieldValue : ""
        };
      });

      // 3. Call API
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          formValues: {}, // We don't use dynamic forms here, just the overridden nodes
          rh_payload_template: {
            ...payloadTemplate,
            nodeInfoList: constructedNodeInfoList
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Generation API failed');
      }

      const taskId = data.taskId;
      setTaskStatuses(prev => ({ ...prev, [task.id]: { ...prev[task.id], taskId } }));

      // 4. Poll Result
      const resultUrl = await pollStatus(taskId, task.id);

      setTaskStatuses(prev => ({
        ...prev,
        [task.id]: { status: 'success', resultUrl, taskId }
      }));

    } catch (err: any) {
      console.error(`Task ${task.id} failed:`, err);
      setTaskStatuses(prev => ({
        ...prev,
        [task.id]: { status: 'failed', error: err.message || 'Unknown error' }
      }));
    }
  };

  const handleBatchGenerate = async () => {
    if (images.length === 0 || !selectedWorkflowId) return;

    const workflow = workflows.find(w => w.id === selectedWorkflowId);
    if (!workflow) return;

    // Get Auth Token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      alert("请先登录！(Please login first)");
      return;
    }

    setIsBatchProcessing(true);

    // Reset statuses of all pending/failed to pending
    const tasksToProcess = images.filter(img => {
       const s = taskStatuses[img.id]?.status;
       return s === 'pending' || s === 'failed';
    });

    setTaskStatuses(prev => {
      const next = { ...prev };
      tasksToProcess.forEach(t => {
        next[t.id] = { status: 'pending' };
      });
      return next;
    });

    const concurrencyLimit = 2;
    const activePromises = new Set<Promise<void>>();

    for (const task of tasksToProcess) {
      const promise = processSingleTask(task, workflow, token).finally(() => {
        activePromises.delete(promise);
      });
      activePromises.add(promise);

      if (activePromises.size >= concurrencyLimit) {
        await Promise.race(activePromises);
      }
    }

    // Wait for the remaining tasks
    await Promise.all(activePromises);

    setIsBatchProcessing(false);
  };

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('status', 'published');

        if (error) {
          console.error("Error fetching workflows:", error);
        } else {
          setWorkflows(data || []);
          if (data && data.length > 0) {
            setSelectedWorkflowId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Exception fetching workflows:", err);
      } finally {
        setIsLoadingWorkflows(false);
      }
    };

    fetchWorkflows();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">批量修图 (Batch Retouch)</h1>

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">选择工作流:</label>
          {isLoadingWorkflows ? (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              加载中...
            </div>
          ) : (
            <select
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-green min-w-[200px]"
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
            >
              {workflows.map(wf => (
                <option key={wf.id} value={wf.id}>
                  {wf.title || '未命名工作流'} (消耗: {wf.cost_points || 0}积分)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

        {/* Left Side: Drag & Drop Area */}
        <div className="col-span-8 flex flex-col gap-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors min-h-[200px] cursor-pointer
              ${isDragging ? 'border-primary-green bg-primary-green/5' : 'border-white/20 bg-[#1a1a1a] hover:border-primary-green/50 hover:bg-[#1f1f1f]'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileInput}
            />
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">点击选择或拖拽图片到此处</p>
            <p className="text-sm text-gray-500">支持批量上传 JPG, PNG 格式</p>
          </div>

          {images.length > 0 && (
             <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex-1">
               <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    已选择的图片 ({images.length})
                  </h3>
                  <button
                    onClick={() => {
                      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
                      setImages([]);
                    }}
                    className="text-xs text-danger-red hover:text-red-400 transition-colors"
                  >
                    清空全部
                  </button>
               </div>

               <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
                 {images.map(img => (
                   <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-black border border-white/10">
                     <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
                     <button
                       onClick={(e) => { e.stopPropagation(); removeFile(img.id); }}
                       className="absolute top-1 right-1 bg-black/60 hover:bg-danger-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                     >
                       <X className="w-3 h-3" />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>



        {/* Right Side: Status/Config */}
        <div className="col-span-4 bg-[#1a1a1a] border border-white/10 rounded-xl flex flex-col overflow-hidden max-h-[700px]">
           <div className="p-6 border-b border-white/5">
             <h2 className="text-xl font-bold text-white mb-2">生成任务状态</h2>
             <p className="text-sm text-gray-500">
               {images.length === 0 ? '暂无任务' : `共 ${images.length} 个任务`}
             </p>
           </div>

           <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#111111]">
             {images.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-600">
                 <RefreshCw className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">请先在左侧上传图片</p>
               </div>
             ) : (
               images.map(img => {
                 const status = taskStatuses[img.id] || { status: 'pending' };
                 return (
                   <div key={img.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-3 flex gap-3 items-center">
                     <div className="w-12 h-12 rounded overflow-hidden bg-black flex-shrink-0 relative">
                       {status.resultUrl ? (
                         <img src={status.resultUrl} className="w-full h-full object-cover" alt="result" />
                       ) : (
                         <img src={img.previewUrl} className="w-full h-full object-cover opacity-50" alt="preview" />
                       )}
                     </div>

                     <div className="flex-1 min-w-0">
                       <p className="text-xs text-gray-400 truncate mb-1">{img.file.name}</p>
                       <div className="flex items-center gap-1.5">
                         {status.status === 'pending' && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 className="w-3 h-3" /> 等待中</span>}
                         {status.status === 'uploading' && <span className="text-xs text-blue-400 flex items-center gap-1"><UploadCloud className="w-3 h-3 animate-pulse" /> 上传中</span>}
                         {status.status === 'generating' && <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 生成中</span>}
                         {status.status === 'success' && <span className="text-xs text-primary-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 已完成</span>}
                         {status.status === 'failed' && <span className="text-xs text-danger-red flex items-center gap-1" title={status.error}><AlertCircle className="w-3 h-3" /> 失败</span>}
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
           </div>

           <div className="p-4 border-t border-white/5 bg-[#1a1a1a]">
             <button
               onClick={handleBatchGenerate}
               disabled={images.length === 0 || isBatchProcessing || !selectedWorkflowId}
               className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                 ${images.length === 0 || isBatchProcessing || !selectedWorkflowId
                   ? 'bg-white/5 text-white/30 cursor-not-allowed'
                   : 'bg-primary-green text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_var(--color-primary-green)]'}`}
             >
               {isBatchProcessing ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   批量处理中...
                 </>
               ) : (
                 <>
                   <Play className="w-5 h-5 fill-current" />
                   开始批量生成
                 </>
               )}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
