import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { getOfficialMaterials } from "@/actions/officialMaterials";
import { getUserUploads, deleteUserUpload, saveUserUpload } from "@/actions/userUploads";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

interface MaterialLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  title?: string;
  type?: "image" | "video";
  nodeCategory?: string;
}

export function MaterialLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "选择模特",
  type = "image",
  nodeCategory,
}: MaterialLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"official" | "uploads">(
    "official",
  );
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [officialMaterials, setOfficialMaterials] = useState<any[]>([]);
  const [loadingOfficial, setLoadingOfficial] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === "uploads" && user) {
      const fetchUploads = async () => {
        setLoadingUploads(true);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) return;
          const files = await getUserUploads(session.access_token, type);
          setUploadHistory(files);
        } catch (e) {
          console.error(e);
        }
        setLoadingUploads(false);
      };
      fetchUploads();
    }
  }, [isOpen, activeTab, user, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("site-assets")
          .upload(fileName, file);
        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("site-assets").getPublicUrl(fileName);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await saveUserUpload(session.access_token, publicUrl, file.type);
        }

        onSelect(publicUrl);
        // Refresh uploads
        if (session) {
          const fetchedFiles = await getUserUploads(session.access_token, type);
          setUploadHistory(fetchedFiles);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
      setIsUploading(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, file: any) => {
    e.stopPropagation(); // Prevent onSelect from triggering
    if (!user || !file.name) return;

    // Optimistic UI update
    const previousHistory = [...uploadHistory];
    setUploadHistory(uploadHistory.filter((f) => f.name !== file.name));

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { success } = await deleteUserUpload(session.access_token, file.url);
    if (!success) {
      // Revert if failed
      setUploadHistory(previousHistory);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Content - stop propagation to avoid closing when clicking inside */}
      <div
        className="bg-[#111111] border border-white/10 rounded-2xl w-[80vw] max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-white/5">
          <button
            onClick={() => setActiveTab("official")}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "official"
                ? "border-[#D0FF2A] text-[#D0FF2A]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            官方素材
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "uploads"
                ? "border-[#D0FF2A] text-[#D0FF2A]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            我的上传
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Local Upload Button (Always First) */}
            {activeTab !== "uploads" && (
              <div
                className="aspect-[3/4] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-colors group relative"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={type === "video" ? "video/*" : "image/*"}
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white">
                  {isUploading ? "上传中..." : "点击上传"}
                </span>
              </div>
            )}

            {/* Mock Image Cards */}
            {activeTab === "official" && loadingOfficial && (
              <div className="col-span-2 md:col-span-4 flex items-center justify-center text-gray-500 py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                加载官方素材中...
              </div>
            )}
            {activeTab === "official" &&
              !loadingOfficial &&
              officialMaterials.filter((m) => m.type === type).length === 0 && (
                <div className="col-span-2 md:col-span-4 flex items-center justify-center text-gray-500 py-12">
                  暂无此节点的官方素材
                </div>
              )}
            {activeTab === "official" &&
              !loadingOfficial &&
              officialMaterials
                .filter((m) => m.type === type)
                .map((m, index) => {
                  const url = m.url;
                  return (
                    <div
                      key={index}
                      className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D0FF2A]/50 transition-all group relative bg-black/40"
                      onClick={() => onSelect(url)}
                    >
                      {type === "video" || url.endsWith(".mp4") ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Mock ${index}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/10 transition-colors" />
                    </div>
                  );
                })}

            {activeTab === "uploads" && loadingUploads && (
              <div className="col-span-2 md:col-span-4 flex items-center justify-center text-gray-500 py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                加载记录中...
              </div>
            )}

            {activeTab === "uploads" &&
              !loadingUploads &&
              uploadHistory.length === 0 && (
                <div className="col-span-1 md:col-span-3 flex items-center justify-center text-gray-500 text-sm">
                  暂无上传记录
                </div>
              )}

            {activeTab === "uploads" &&
              !loadingUploads &&
              uploadHistory.map((file, index) => {
                const url = file.url;
                return (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D0FF2A]/50 transition-all group relative bg-black/40"
                    onClick={() => onSelect(url)}
                  >
                    {type === "video" ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Upload ${index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/10 transition-colors" />

                    {/* Delete Button (visible on hover) */}
                    <button
                      onClick={(e) => handleDeleteHistory(e, file)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-danger-red rounded-full text-white transition-colors z-10 backdrop-blur-md opacity-0 group-hover:opacity-100"
                      title="删除记录"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
