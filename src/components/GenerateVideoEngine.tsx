'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, UploadCloud, Loader2, Trash2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

interface DynamicNode {
  nodeId: string;
  fieldName: string;
  description?: string;
  fieldValue?: string | number;
}

export function GenerateVideoEngine() {
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, string | number>>({});
  const [activeUploads, setActiveUploads] = useState<Record<string, boolean>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const setIsAuthOpen = useAuthStore((state) => state.setIsAuthOpen);
  const 积分余额 = useAuthStore((state) => state.积分余额);

  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .ilike('title', '%视频%')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) {
          setWorkflow(data);

          const nodeInfoList = data.rh_payload_template?.nodeInfoList;
          if (nodeInfoList && Object.keys(dynamicFormValues).length === 0) {
            const initialValues: Record<string, string | number> = {};
            nodeInfoList.forEach((node: DynamicNode) => {
              const isFile = node.fieldName === 'image' || node.fieldName === 'video';
              initialValues[node.nodeId] = isFile ? "" : (node.fieldValue !== undefined ? node.fieldValue : "");
            });
            setDynamicFormValues(initialValues);
          }
        }
      } catch (err) {
        console.error("Failed to fetch workflow for video engine", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflow();
  }, []);

  const handleDynamicUpload = async (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveUploads(prev => ({ ...prev, [nodeId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('site-assets').upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      if (!publicUrl) throw new Error('获取文件链接失败');

      setDynamicFormValues(prev => ({ ...prev, [nodeId]: publicUrl }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [nodeId]: objectUrl }));
    } catch (err: any) {
      console.error('上传出错:', err);
      if (!user || (err.message && (err.message.includes('403') || err.message.includes('401')))) {
         // handle error silently or with global toast if available
      } else {
         alert("上传失败，请重试");
      }
    } finally {
      setActiveUploads(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  const handleDynamicChange = (nodeId: string, value: string | number) => {
    setDynamicFormValues(prev => ({ ...prev, [nodeId]: value }));
  };

  // eslint-disable-next-line
  const pollForResult = async (taskId: string, workflowId: string) => {
    if (!taskId) return;
    let attempts = 0;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= 720) { // 60 minutes
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setPollStatus('生成超时，请稍后重试');
        setIsGenerating(false);
        setCurrentTaskId(null);
        return;
      }

      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: taskId })
        });
        if (!res.ok) {
            console.warn('网络波动，跳过本次解析');
            return;
        }
        const data = await res.json();

        if (data && data.code === 0) {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           if (data.data && data.data.length > 0 && data.data[0].fileUrl) {
              const fileUrl = data.data[0].fileUrl;
              setGeneratedMediaUrl(fileUrl);
              setIsGenerating(false);
              setCurrentTaskId(null);

              let finalUserId = user?.id;
              if (!finalUserId) {
                  const { data: { session } } = await supabase.auth.getSession();
                  finalUserId = session?.user?.id;
              }

              if (finalUserId) {
                  await supabase
                      .from('video_tasks')
                      .insert({
                          user_id: finalUserId,
                          workflow_id: workflowId,
                          result_video_url: fileUrl,
                          cost_points: 0
                      });
              }
           } else {
              setPollStatus('生成成功但未找到视频URL');
              setIsGenerating(false);
              setCurrentTaskId(null);
           }
        } else if (data && data.code === -1) {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           setPollStatus('生成失败');
           setIsGenerating(false);
           setCurrentTaskId(null);
        } else if (data && data.code === 1) {
           // Queueing or running
           let progressMsg = `生成中 (耗时 ${(attempts * 5)}s)...`;
           if (data.data && data.data.length > 0 && data.data[0].progress) {
             progressMsg = `生成中 - 进度 ${data.data[0].progress}%`;
           }
           setPollStatus(progressMsg);
        }
      } catch (err) {
        console.error("轮询异常:", err);
      }
    }, 5000);
  };


  const handleStop = async () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsGenerating(false);
    setPollStatus(null);
    if (currentTaskId) {
      try {
        await fetch('/api/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: currentTaskId })
        });
      } catch (err) {
        console.error("Failed to cancel task", err);
      }
      setCurrentTaskId(null);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!workflow || !workflow.rh_payload_template) {
      alert("工作流配置未加载完毕");
      return;
    }

    const cost = workflow.cost_points !== undefined && workflow.cost_points !== null ? Number(workflow.cost_points) : 10;
    if (积分余额 < cost) {
      alert("积分不足，请先充值");
      return;
    }

    // Check if required files are uploaded
    const nodeInfoList = workflow.rh_payload_template.nodeInfoList;
    if (nodeInfoList && nodeInfoList.length > 0) {
      const isMissingParams = nodeInfoList.some((node: DynamicNode) => {
        const val = dynamicFormValues[node.nodeId];
        return val === "" || val === null || val === undefined;
      });

      if (isMissingParams) {
        alert("请上传所有必需的图片/参数");
        return;
      }
    }

    setIsGenerating(true);
    setPollStatus("任务提交中...");
    setGeneratedMediaUrl(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error("未获取到认证信息");

      const constructedNodeInfoList = workflow.rh_payload_template?.nodeInfoList?.map((node: DynamicNode) => {
        let value = dynamicFormValues[node.nodeId];
        if (value === undefined) {
          value = node.fieldValue !== undefined ? node.fieldValue : "";
        }
        return {
          nodeId: String(node.nodeId),
          fieldName: String(node.fieldName || (node as any).type || "text"),
          fieldValue: value
        };
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          formValues: dynamicFormValues,
          rh_payload_template: {
            ...workflow.rh_payload_template,
            nodeInfoList: constructedNodeInfoList
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || '生成失败');

      setCurrentTaskId(data.taskId);
      pollForResult(data.taskId, workflow.id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || String(err));
      setIsGenerating(false);
      setPollStatus(null);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Input & Action Area */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-5xl font-extrabold text-white mb-4">
              一键生成爆款视频
            </h2>
            <p className="text-gray-400 text-lg">轻松圈起流量</p>
          </div>

          {/* Parameters Configuration Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
             {loading ? (
                 <div className="col-span-1 md:col-span-3 flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                 </div>
             ) : workflow?.rh_payload_template?.nodeInfoList ? (
                 workflow.rh_payload_template.nodeInfoList.map((node: DynamicNode) => {
                    const isFile = node.fieldName === 'image' || node.fieldName === 'video';
                    const isImage = node.fieldName === 'image';
                    const value = dynamicFormValues[node.nodeId];
                    const isUploadingThis = activeUploads[node.nodeId];

                    if (!isFile) return null; // Only render files in the big blocks for now

                    return (
                        <label key={node.nodeId} className="relative text-gray-500 flex flex-col items-center justify-center bg-[#111] rounded-2xl h-48 border border-white/5 hover:border-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.2)] transition-all cursor-pointer overflow-hidden group">
                           <input
                              type="file"
                              className="hidden"
                              accept={isImage ? "image/jpeg, image/png, image/webp" : "video/mp4, video/webm"}
                              onClick={(e) => {
                                if (!user) {
                                  e.preventDefault();
                                  setIsAuthOpen(true);
                                }
                              }}
                              onChange={(e) => handleDynamicUpload(e, node.nodeId)}
                            />
                            {!value ? (
                                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                    {isUploadingThis ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : <UploadCloud className="w-8 h-8 text-gray-400" />}
                                    <span className="font-medium">{isUploadingThis ? "正在上传..." : `+ 选择${node.description || (isImage ? '图片' : '视频')}`}</span>
                                </div>
                            ) : (
                                <>
                                  {isImage ? (
                                      <img src={previewUrls[node.nodeId] || (value as string)} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
                                  ) : (
                                      <video src={previewUrls[node.nodeId] || (value as string)} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
                                  )}
                                  <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDynamicChange(node.nodeId, "");
                                        if (previewUrls[node.nodeId]) {
                                          URL.revokeObjectURL(previewUrls[node.nodeId]);
                                          const newPreviews = { ...previewUrls };
                                          delete newPreviews[node.nodeId];
                                          setPreviewUrls(newPreviews);
                                        }
                                      }}
                                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors z-10 backdrop-blur-md opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                            )}
                        </label>
                    );
                 })
             ) : (
                <>
                    <div className="text-gray-500 flex items-center justify-center bg-[#111] rounded-2xl h-48 border border-white/5 hover:border-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.2)] transition-all cursor-pointer">
                    <span className="font-medium">+ 选择服装</span>
                    </div>
                    <div className="text-gray-500 flex items-center justify-center bg-[#111] rounded-2xl h-48 border border-white/5 hover:border-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.2)] transition-all cursor-pointer">
                    <span className="font-medium">+ 选择模特</span>
                    </div>
                    <div className="text-gray-500 flex items-center justify-center bg-[#111] rounded-2xl h-48 border border-white/5 hover:border-[#D0FF2A] hover:shadow-[0_0_15px_rgba(208,255,42,0.2)] transition-all cursor-pointer">
                    <span className="font-medium">+ 选择热门视频</span>
                    </div>
                </>
             )}
          </div>

          {/* Generate Action Area */}
          <div className="flex flex-col items-center justify-center gap-4 mt-auto pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">预估单次积分消耗 ≈ {workflow?.cost_points !== undefined && workflow?.cost_points !== null ? workflow.cost_points : 10} 积分</span>
              <div className="relative group cursor-help ml-1">
                <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black border border-white/10 text-xs text-gray-300 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                  每次生成将固定扣除显示的积分数。
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 text-black font-bold text-lg h-14 px-12 rounded-xl transition-all flex items-center justify-center bg-[#D0FF2A] hover:bg-[#bceb24] shadow-[0_0_15px_#D0FF2A] hover:shadow-[0_0_20px_#D0FF2A] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isGenerating ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{pollStatus || '生成中...'}</span>
                    </div>
                ) : '立即生成'}
              </button>

              {isGenerating && (
                <button
                  onClick={handleStop}
                  className="px-8 text-white font-bold text-lg h-14 rounded-xl transition-all flex items-center justify-center bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  取消生成
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Result Area */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Reference Video Window */}
            <div className="bg-[#111] rounded-2xl border border-white/5 aspect-[9/16] w-full relative flex flex-col items-center justify-center overflow-hidden">
               <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-gray-400 backdrop-blur-md z-10 border border-white/10">
                 加载参考视频
               </div>
               <div className="flex flex-col items-center justify-center gap-2 pointer-events-none opacity-50">
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                  <span className="font-medium text-sm text-gray-500">暂无参考</span>
               </div>
            </div>

            {/* Generated Result Window */}
            <div className="bg-[#111] rounded-2xl border border-white/5 aspect-[9/16] w-full relative flex items-center justify-center overflow-hidden group">
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-[#D0FF2A] backdrop-blur-md z-10 border border-[#D0FF2A]/20">
                 生成结果
              </div>

              {generatedMediaUrl ? (
                  <>
                    <video
                        src={generatedMediaUrl}
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                        controls
                        autoPlay
                        loop
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button
                        title="下载"
                        className="p-2 bg-black/60 hover:bg-[#D0FF2A] hover:text-black rounded-full text-white transition-colors backdrop-blur-md border border-white/10 hover:border-transparent"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        title="删除/清空"
                        onClick={() => setGeneratedMediaUrl(null)}
                        className="p-2 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md border border-white/10 hover:border-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
              ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D0FF2A]" />
                      <span className="text-xs text-center px-2">{pollStatus || '正在生成...'}</span>
                  </div>
              ) : (
                  <span className="text-gray-500 text-sm">暂无生成结果</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
