'use client';

import React, { useState, useEffect } from 'react';

enum PollStatus {
  QUEUED = '排队中 (Queued)',
  GENERATING = '生成中 (Generating)'
}

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
  const [elapsedTime, setElapsedTime] = useState(0);

  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);


  const user = useAuthStore((state) => state.user);
  const setIsAuthOpen = useAuthStore((state) => state.setIsAuthOpen);
  const 积分余额 = useAuthStore((state) => state.积分余额);
  const set积分余额 = useAuthStore((state) => state.set积分余额);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const extractErrorMessage = (err: any): string => {
    if (!err) return '未知错误';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    try {
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  };


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
      if (error) throw new Error('Supabase 上传失败: ' + error.message);

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
         setToastMessage({ type: "error", text: "上传失败，请重试" });
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
      if (attempts >= 720) { // 60 minutes limit (720 * 5s = 3600s)
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setToastMessage({ type: "error", text: '生成超时，请稍后重试' });
        setIsGenerating(false);
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
            return; // 遇到 500 直接 return，等待下次轮询，绝不准崩！
        }
        const data = await res.json();

        if (data && data.code === 0) {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
           const activeDbTask = localStorage.getItem(`active_db_task_${workflowId}`);
           localStorage.removeItem(`active_db_task_${workflowId}`);

           if (data.data && data.data.length > 0 && data.data[0].fileUrl) {
              const fileUrl = data.data[0].fileUrl;
              setGeneratedMediaUrl(fileUrl);
              setIsGenerating(false);

              // ==== 核心入库逻辑开始 ====
              console.log("⏳ 准备将资产写入 video_tasks 表...");

              // 1. 防弹级实时获取当前用户 (绕过 React 闭包陷阱)
              let finalUserId = user?.id; // 先尝试拿 state 里的
              if (!finalUserId) {
                  // 如果 state 里没有，强行向 Supabase 要最新状态
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                  finalUserId = session?.user?.id;
                  if (sessionError) console.error("获取 Session 异常:", sessionError);
              }

              // 2. 最终校验
              if (!finalUserId) {
                  console.error("❌ 严重错误: 实时从 Supabase 获取用户依然失败，无法入库");
                  setToastMessage({ text: "云端保存失败：登录状态异常，请刷新重试", type: "error" });
                  return; // 终止执行
              }

              // 3. 执行入库
              if (activeDbTask) {
                const { error: updateError } = await supabase
                  .from('video_tasks')
                  .update({
                      result_video_url: fileUrl,
                      status: 'success'
                  })
                  .eq('id', activeDbTask);

                if (updateError) {
                    console.error("❌ 数据库写入彻底失败:", updateError);
                    setToastMessage({ text: `云端保存失败: ${updateError.message}`, type: "error" });
                } else {
                    console.log("✅ 资产已成功写入 video_tasks 表！");
                    setToastMessage({ text: "生成成功！已保存至我的创作", type: "success" });
                }
              } else {
                const calculatedCost = workflow?.cost_points !== undefined && workflow?.cost_points !== null ? Number(workflow.cost_points) : 10;
                const { error: insertError } = await supabase
                    .from('video_tasks')
                    .insert({
                        user_id: finalUserId,   // 使用实时获取到的真实 ID
                        workflow_id: workflowId,
                        result_video_url: fileUrl,
                        status: 'success',
                        cost_points: calculatedCost
                    });

                if (insertError) {
                    console.error("❌ 数据库写入彻底失败:", insertError);
                    setToastMessage({ text: `云端保存失败: ${insertError.message}`, type: "error" });
                } else {
                    console.log("✅ 资产已成功写入 video_tasks 表！");
                    setToastMessage({ text: "生成成功！已保存至我的创作", type: "success" });
                }
              }
              // ==== 核心入库逻辑结束 ====

           } else {
              setToastMessage({ type: "error", text: '生成成功但未找到视频URL' });
              setIsGenerating(false);
           }
        } else if (data && (data.code === 804 || data.code === 813)) {
           // RUNNING or QUEUED, just wait for the next tick
           setPollStatus(data.code === 804 ? PollStatus.GENERATING : PollStatus.QUEUED);
        } else if (data && data.code === 805) {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
           localStorage.removeItem(`active_db_task_${workflowId}`);
           const errorData = data.data?.failedReason || '生成失败';
           setToastMessage({ type: "error", text: extractErrorMessage(errorData) });
           setIsGenerating(false);
        } else if (data && data.code !== undefined) {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
           localStorage.removeItem(`active_db_task_${workflowId}`);
           const errorData = data.msg || data.message || '未知状态异常';
           setToastMessage({ type: "error", text: extractErrorMessage(errorData) });
           setIsGenerating(false);
        }
      } catch (error) {
        console.warn('请求阻断，跳过本次', error);
      }
    }, 5000); // Poll every 5 seconds
  };



  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Recover task polling from local storage
  useEffect(() => {
    if (typeof window === 'undefined' || !workflow?.id) return;

    const storageKey = `active_task_${workflow.id}`;
    const cachedTaskId = localStorage.getItem(storageKey);
    const startKey = `task_start_${workflow.id}`;
    const startTime = localStorage.getItem(startKey);

    if (cachedTaskId) {
        console.log("恢复执行任务:", cachedTaskId);
        if (startTime) {
          const passedSeconds = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
          setElapsedTime(passedSeconds > 0 ? passedSeconds : 0);
        }
        setCurrentTaskId(cachedTaskId);
        setIsGenerating(true);
        setPollStatus("正在恢复任务状态...");
        pollForResult(cachedTaskId, workflow.id);
    }
  }, [workflow?.id]);


  const handleStop = async () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsGenerating(false);
    setPollStatus(null);
    if (workflow?.id) {
       localStorage.removeItem(`active_task_${workflow.id}`);
       localStorage.removeItem(`task_start_${workflow.id}`);
       localStorage.removeItem(`active_db_task_${workflow.id}`);
    }
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
      setToastMessage({ type: "error", text: "工作流配置未加载完毕" });
      return;
    }

    const cost = workflow.cost_points !== undefined && workflow.cost_points !== null ? Number(workflow.cost_points) : 10;
    if (积分余额 < cost) {
      setToastMessage({ type: "error", text: "积分不足，请先充值" });
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
        setToastMessage({ type: "error", text: "请上传所有必需的图片/参数" });
        return;
      }
    }

    setIsGenerating(true);
    setPollStatus("任务提交中...");
    setGeneratedMediaUrl(null);

    setElapsedTime(0);



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
      if (data.newPoints !== undefined) set积分余额(data.newPoints);

      // Store in local storage to prevent loss on refresh
      localStorage.setItem(`active_task_${workflow.id}`, data.taskId);
      localStorage.setItem(`task_start_${workflow.id}`, Date.now().toString());
      if (data.dbTaskId) {
        localStorage.setItem(`active_db_task_${workflow.id}`, data.dbTaskId);
      }

      pollForResult(data.taskId, workflow.id);

    } catch (err: any) {
      console.error(err);
      setToastMessage({ type: "error", text: extractErrorMessage(err) });
      setIsGenerating(false);
      setPollStatus(null);
    }
  };


  return (
    <div className="w-full relative">
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium z-[100] transition-all shadow-lg ${toastMessage.type === 'error' ? 'bg-danger-red text-white' : 'bg-primary-green text-black'}`}>
          {toastMessage.text}
        </div>
      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
             {loading ? (
                 <div className="col-span-1 md:col-span-2 flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                 </div>
             ) : workflow?.rh_payload_template?.nodeInfoList ? (
                 workflow.rh_payload_template.nodeInfoList.slice(0, 2).map((node: DynamicNode) => {
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
                        <span>{pollStatus || `生成中 (${elapsedTime}s)`}</span>
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
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-center px-2 text-[#D0FF2A] animate-pulse">{pollStatus || '正在生成，请耐心等待...'}</span>
                        <div className="bg-[#D0FF2A]/10 text-[#D0FF2A] text-xs font-mono px-3 py-1 rounded-full border border-[#D0FF2A]/20">
                          已用时间: {elapsedTime} 秒
                        </div>
                      </div>
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
