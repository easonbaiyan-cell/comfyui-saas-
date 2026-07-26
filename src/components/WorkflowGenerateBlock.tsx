'use client';


import React, { useState, useEffect } from 'react';
import { Play, UploadCloud, HelpCircle, Minus, Plus, Zap, Heart, MessageCircle, Download, Trash2, Share2, X, Loader2, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';






// Type Definitions for Dynamic Forms
interface DynamicNode {
  nodeId: string;
  fieldName: string;
  description?: string;
  fieldValue?: string | number;
}



function formatLikes(likes: number | null): string {
  if (likes == null) return "0";
  if (likes >= 10000) {
    return (likes / 10000).toFixed(1) + 'w';
  }
  return likes.toString();
}

export interface WorkflowData {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  cost_points?: number;
  points_cost?: number;
  credit_cost?: number;
  reference_video_url?: string;
  video_url?: string;
  cover_image_url?: string;
  cover_url?: string;
  virtual_platform?: string;
  virtual_likes?: number;
  rh_payload_template?: {
    nodeInfoList?: DynamicNode[];
  };
}

export interface WorkflowBlockProps {
  workflow: WorkflowData;
}

export function WorkflowGenerateBlock({ workflow }: WorkflowBlockProps) {

  // New Generation Pipeline States
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);

  const isImageUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');
  };

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
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const user = useAuthStore((state) => state.user);
  const setIsAuthOpen = useAuthStore((state) => state.setIsAuthOpen);
  const 积分余额 = useAuthStore((state) => state.积分余额);
  const set积分余额 = useAuthStore((state) => state.set积分余额);


  const workflowId = workflow?.id;
  const loadingWorkflow = false;


  const cost = workflow?.cost_points !== undefined ? Number(workflow?.cost_points) : (workflow?.points_cost !== undefined ? Number(workflow?.points_cost) : (workflow?.credit_cost ? Number(workflow?.credit_cost) : 0));

  // Dynamic Form State
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, string | number>>({});
  const [activeUploads, setActiveUploads] = useState<Record<string, boolean>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const nodeInfoList = workflow?.rh_payload_template?.nodeInfoList;
  useEffect(() => {
    if (nodeInfoList && Object.keys(dynamicFormValues).length === 0) {
      const initialValues: Record<string, string | number> = {};
      nodeInfoList.forEach((node: DynamicNode) => {
        const isFile = node.fieldName === 'image' || node.fieldName === 'video';
        initialValues[node.nodeId] = isFile ? "" : (node.fieldValue !== undefined ? node.fieldValue : "");
      });
      // Workaround to bypass sync effect setter warning while still providing initial default state from backend
      setTimeout(() => {
        setDynamicFormValues((prev) => Object.keys(prev).length === 0 ? initialValues : prev);
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeInfoList]);

  const handleDynamicUpload = async (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => {
    if (!user) {
      // 1. 拦截上传动作 (Image Upload Guard)
      setErrorMsg(null);
      setIsAuthOpen(true);
      setToastMessage({ type: 'error', text: '请先登录后再上传图片' });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setActiveUploads(prev => ({ ...prev, [nodeId]: true }));
    setErrorMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('获取文件链接失败');
      }

      setDynamicFormValues(prev => ({ ...prev, [nodeId]: publicUrl }));

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [nodeId]: objectUrl }));
    } catch (err: any) {
      console.error('上传出错:', err);
      if (!user || (err.message && (err.message.includes('403') || err.message.includes('401') || err.message.includes('Row-level security') || err.message.includes('Failed to fetch')))) {
        setErrorMsg(null);
      } else {
        setErrorMsg("上传失败，请重试");
      }
    } finally {
      setActiveUploads(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  const handleDynamicChange = (nodeId: string, value: string | number) => {
    setDynamicFormValues(prev => ({ ...prev, [nodeId]: value }));
  };

  const renderDynamicNode = (node: DynamicNode) => {
    const value = dynamicFormValues[node.nodeId];

    if (node.fieldName === 'image' || node.fieldName === 'video') {
      const isUploadingThis = activeUploads[node.nodeId];
      const isImage = node.fieldName === 'image';

      return (
        <div key={node.nodeId} className="mb-6 w-full bg-[#111111] border border-white/10 rounded-2xl aspect-[3/4] flex flex-col overflow-hidden">
          <label className="block w-full h-full cursor-pointer flex-1">
            <input
              type="file"
              className="hidden"
              accept={isImage ? "image/jpeg, image/png, image/webp" : "video/mp4, video/webm"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  setErrorMsg(null);
                  setIsAuthOpen(true);
                  setToastMessage({ type: 'error', text: '请先登录后再上传文件' });
                }
              }}
              onChange={(e) => handleDynamicUpload(e, node.nodeId)}
            />
            {!value ? (
              <div className="border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center gap-4 h-full">
                <div className="h-16 w-16 bg-black/40 rounded-full flex items-center justify-center border border-white/5">
                  {isUploadingThis ? <Loader2 className="h-8 w-8 text-gray-400 animate-spin" /> : <UploadCloud className="h-8 w-8 text-gray-400" />}
                </div>
                <div>
                  <p className="text-base font-medium text-white mb-1">{isUploadingThis ? "正在上传..." : "点击加载上传"}</p>
                </div>
              </div>
            ) : (
              <div className="relative border border-dashed border-white/20 rounded-xl overflow-hidden bg-black/40 flex justify-center items-center p-2 group h-full">
                {isImage ? (
                  <img src={previewUrls[node.nodeId] || (value as string)} alt="Uploaded" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <video src={previewUrls[node.nodeId] || (value as string)} className="h-full w-full object-contain rounded-lg" controls />
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
                  className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-danger-red rounded-full text-white transition-colors z-10 backdrop-blur-md opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </label>
        </div>
      );
    }

    // For other values like numbers or text
    return (
      <div key={node.nodeId} className="bg-[#1a1a1a] rounded-lg p-4 mb-3 flex items-center justify-between border border-transparent hover:border-white/5 transition-colors">
        <span className="text-sm text-gray-200">{node.description || node.fieldName}</span>
        <div className="flex items-center gap-1 bg-[#131622] rounded-md p-1 border border-white/5">
          <button
            onClick={() => handleDynamicChange(node.nodeId, Math.max(0, (Number(value) || 0) - 1))}
            className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
             type="text"
             value={value !== undefined ? value : ''}
             onChange={(e) => handleDynamicChange(node.nodeId, e.target.value)}
             className="w-16 text-center text-sm font-medium bg-transparent outline-none border-none text-white"
          />
          <button
            onClick={() => handleDynamicChange(node.nodeId, (Number(value) || 0) + 1)}
            className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
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
    if (typeof window === 'undefined' || !workflowId) return;

    const storageKey = `active_task_${workflowId}`;
    const cachedTaskId = localStorage.getItem(storageKey);
    const startKey = `task_start_${workflowId}`;
    const startTime = localStorage.getItem(startKey);

    if (cachedTaskId) {
        console.log("恢复执行任务:", cachedTaskId);
        if (startTime) {
          const passedSeconds = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
          setElapsedTime(passedSeconds > 0 ? passedSeconds : 0);
        }
        setTaskId(cachedTaskId);
        setIsGenerating(true);
        setPollStatus("正在恢复任务状态...");
        // 必须将 ID 作为参数传给轮询函数！
        pollForResult(cachedTaskId);
    }
  }, [workflowId]); // 依赖数组必须包含 workflowId

  const handleGenerate = async () => {
    // 2. 拦截生成动作 (Generate Button Guard)
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    // 请在 fetch 请求发生前，优先执行以下拦截
    if (!workflow || !workflow.rh_payload_template) {
      console.error("拦截提交: workflow 数据丢失或 rh_payload_template 为 null", workflow);
      // 触发 UI 提示（请根据项目中实际使用的提示库如 react-hot-toast 或 sonner 进行适配）
      setErrorMsg("工作流配置尚未加载完毕或数据缺失，请刷新重试。");
      return; // 强制阻断，绝对禁止向下执行 fetch
    }

    setElapsedTime(0);

    // Fetch session first for accurate auth check
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || user;

    const nodeInfoList = workflow?.rh_payload_template?.nodeInfoList;
    if (nodeInfoList && nodeInfoList.length > 0) {
      const isMissingParams = nodeInfoList.some((node: DynamicNode) => {
        const val = dynamicFormValues[node.nodeId];
        return val === "" || val === null || val === undefined;
      });

      if (isMissingParams) {
        setErrorMsg("请上传所有必需的图片/参数");
        return;
      }
    }
    if (!currentUser) {
      setErrorMsg("请先登录");
      return;
    }

    const finalCost = cost;

    if (积分余额 < finalCost) {
      setErrorMsg("积分不足，请先充值");
      setToastMessage({ text: '积分不足，请前往充值', type: 'error' });
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedMediaUrl(null);
    setPollStatus(null);

    try {
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("未获取到认证信息");
      }

      // Construct nodeInfoList keeping strict types (do not convert to string)
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
          workflowId: workflowId,
          formValues: dynamicFormValues,
          rh_payload_template: {
            ...workflow.rh_payload_template,
            nodeInfoList: constructedNodeInfoList
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || '生成失败，请查看控制台');
      }

      setTaskId(data.taskId);

      // REMOVED: set积分余额(data.newPoints); // DO NOT blindly trust API

      // Store in local storage to prevent loss on refresh
      localStorage.setItem(`active_task_${workflowId}`, data.taskId);
      localStorage.setItem(`task_start_${workflowId}`, Date.now().toString());

      // Start Polling
      pollForResult(data.taskId);

    } catch (err: unknown) {
      setErrorMsg((err instanceof Error ? err.message : String(err)));
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedMediaUrl) return;
    try {
      const res = await fetch(generatedMediaUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'papagaga_result';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(generatedMediaUrl, '_blank');
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要清除当前结果吗？')) {
      setGeneratedMediaUrl(null);
      setElapsedTime(0);
    }
  };

  const handleShare = async () => {
    if (!generatedMediaUrl) return;
    try {
      await navigator.clipboard.writeText(generatedMediaUrl);
      setToastMessage({ text: '链接已复制到剪贴板', type: 'success' });
    } catch (err) {
      console.error('复制失败', err);
      setToastMessage({ text: '复制失败，请手动复制', type: 'error' });
    }
  };

  async function pollForResult(currentTaskId: string) {
    if (!currentTaskId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= 720) { // 60 minutes limit (720 * 5s = 3600s)
        clearInterval(interval);
        setErrorMsg('生成超时，请稍后重试');
        setIsGenerating(false);
        return;
      }

      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: currentTaskId })
        });
        if (!res.ok) {
            console.warn('网络波动，跳过本次解析');
            return; // 遇到 500 直接 return，等待下次轮询，绝不准崩！
        }
        const data = await res.json();

        if (data && data.code === 0) {
           clearInterval(interval);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
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
              const { error: insertError } = await supabase
                  .from('video_tasks')
                  .insert({
                      user_id: finalUserId,   // 使用实时获取到的真实 ID
                      workflow_id: workflowId,
                      result_video_url: fileUrl,
                      cost_points: 0
                  });

              if (insertError) {
                  console.error("❌ 数据库写入彻底失败:", insertError);
                  setToastMessage({ text: `云端保存失败: ${insertError.message}`, type: "error" });
              } else {
                  console.log("✅ 资产已成功写入 video_tasks 表！");
                  setToastMessage({ text: "生成成功！已保存至我的创作", type: "success" });
              }
              // ==== 核心入库逻辑结束 ====

           } else {
              setErrorMsg('生成成功但未找到视频/图片URL');
              setIsGenerating(false);
           }
        } else if (data && (data.code === 804 || data.code === 813)) {
           // RUNNING or QUEUED, just wait for the next tick
           setPollStatus(data.code === 804 ? '正在拼命生成中...' : '排队中...');
        } else if (data && data.code === 805) {
           clearInterval(interval);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
           const errorData = data.data?.failedReason || '生成失败';
           setErrorMsg(extractErrorMessage(errorData));
           setIsGenerating(false);
        } else if (data && data.code !== undefined) {
           clearInterval(interval);
           localStorage.removeItem(`active_task_${workflowId}`);
           localStorage.removeItem(`task_start_${workflowId}`);
           const errorData = data.msg || data.message || '未知状态异常';
           setErrorMsg(extractErrorMessage(errorData));
           setIsGenerating(false);
        }
      } catch (error) {
        console.warn('请求阻断，跳过本次', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  if (loadingWorkflow) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] text-white flex items-center justify-center flex-col">
        <Loader2 className="w-10 h-10 animate-spin text-primary-green mb-4" />
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!workflow || !workflow.rh_payload_template) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] text-white flex items-center justify-center flex-col">
        <div className="bg-[#131622] p-8 rounded-2xl border border-white/10 shadow-xl max-w-md w-full text-center">
          <HelpCircle className="w-16 h-16 text-danger-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">数据加载异常</h2>
          <p className="text-gray-400 text-sm mb-6">
            抱歉，该工作流的数据已损坏或配置不完整，无法继续操作。请返回重试或联系管理员。
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a0a] text-white overflow-hidden">
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium z-[100] transition-all shadow-lg ${toastMessage.type === 'error' ? 'bg-danger-red text-white' : 'bg-primary-green text-black'}`}>
          {toastMessage.text}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full w-full">
        {/* Middle Column: Parameters and Actions */}
        <div className="border-r border-white/5 overflow-y-auto h-full relative flex flex-col lg:col-span-8">
          <div className="p-6 flex-1 w-full flex flex-col">
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-1">轻松圈起流量</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">一键生成爆款视频</h2>
              <p className="text-sm text-gray-400 mb-6">轻松圈起流量</p>
            </div>

            {errorMsg && (
              <p className="text-danger-red text-sm mb-4 text-center">{errorMsg}</p>
            )}

            {workflow?.rh_payload_template?.nodeInfoList && workflow.rh_payload_template.nodeInfoList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workflow.rh_payload_template?.nodeInfoList?.map(renderDynamicNode)}
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-10">该工作流暂无配置参数</div>
            )}

            {/* Top Action Bar */}
            <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between gap-4 mt-8">
              {/* Cost Estimation */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">预估单次积分消耗</span>
                <span className="text-sm text-gray-400">≈</span>
                <div className="flex items-center gap-1 text-primary-green font-semibold bg-primary-green/10 px-3 py-1.5 rounded-full border border-primary-green/20">
                  <Zap className="h-4 w-4 fill-current" />
                  <span className="text-[#D4FF00]">
                    {cost} 积分
                  </span>
                </div>
                <div className="relative group cursor-help ml-1">
                  <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black border border-white/10 text-xs text-gray-300 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                    扣除规则：每次生成将固定扣除显示的积分数。
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex items-center gap-4 w-full mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || Object.values(activeUploads).some(Boolean)}
                  className={`flex-1 w-full text-black font-bold text-lg h-14 px-12 rounded-xl transition-all flex items-center justify-center ${
                    isGenerating
                      ? 'bg-primary-green/50 cursor-not-allowed'
                      : 'bg-primary-green hover:bg-primary-green shadow-[0_0_15px_var(--color-primary-green)] hover:shadow-[0_0_20px_var(--color-primary-green)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    "立即生成"
                  )}
                </button>
                <button className="bg-red-600 text-white font-medium rounded-xl px-6 h-14 whitespace-nowrap">取消生成</button>
              </div>

              {/* Extra note */}
              <p className="text-xs text-gray-500 mt-1">
                *实际消耗将按照云端算力真实运行时长（每秒）精准核算扣除
              </p>
            </div>
          </div>
        </div>


        {/* Right Column: Generated Video and Actions */}
        <div className="p-6 flex flex-col items-center justify-start overflow-y-auto h-full lg:col-span-4">
          <div className="w-full max-w-sm flex flex-col">
            {/* Video Placeholder */}
            <div className="bg-[#131622] rounded-2xl aspect-[9/16] w-full relative flex flex-col items-center justify-center shadow-xl overflow-hidden border border-white/5">
              <div className="absolute top-4 left-4 z-10 border border-[#D4FF3F] text-[#D4FF3F] rounded-full px-4 py-1 text-sm inline-block">生成结果</div>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-primary-green">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium animate-pulse">{pollStatus || '正在生成，请耐心等待...'}</p>
                    <div className="bg-primary-green/10 text-primary-green text-xs font-mono px-3 py-1 rounded-full border border-primary-green/20">
                      已用时间: {elapsedTime} 秒
                    </div>
                  </div>
                  {taskId && <p className="text-xs text-primary-green/60 mt-2 font-mono">Task: {taskId}</p>}
                </div>
              ) : generatedMediaUrl ? (
                isImageUrl(generatedMediaUrl) ? (
                  <img
                    src={generatedMediaUrl}
                    alt="生成结果"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={generatedMediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                )
              ) : (
                <span className="text-gray-600 text-sm">暂无生成结果</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-4 h-9 items-center">
              <button
                disabled={!generatedMediaUrl}
                onClick={handleDownload}
                className={`p-2 transition-colors ${generatedMediaUrl ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                disabled={!generatedMediaUrl}
                onClick={handleReset}
                className={`p-2 transition-colors ${generatedMediaUrl ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                disabled={!generatedMediaUrl}
                onClick={handleShare}
                className={`p-2 transition-colors ${generatedMediaUrl ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Data Records Text */}
            {generatedMediaUrl && (
              <div className="text-xs text-gray-500 flex flex-col gap-1 mt-4">
                <span>生成时间：{new Date().toLocaleString()}</span>
                <span>有效期：<span className="text-primary-green/80">9</span>天后过期</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
