import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface MaterialLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  title?: string;
}

const mockImages = [
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=750&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=750&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=750&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=750&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=750&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=750&fit=crop',
];

export function MaterialLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "选择模特",
}: MaterialLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'official' | 'uploads'>('official');
  const [uploadHistory, setUploadHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_uploaded_materials');
      if (stored) {
        try {
          setUploadHistory(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse uploaded materials history', e);
        }
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const newHistory = [blobUrl, ...uploadHistory];
      setUploadHistory(newHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_uploaded_materials', JSON.stringify(newHistory));
      }
      onSelect(blobUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };

  const handleDeleteHistory = (e: React.MouseEvent, urlToDelete: string) => {
    e.stopPropagation(); // Prevent onSelect from triggering
    const newHistory = uploadHistory.filter((url) => url !== urlToDelete);
    setUploadHistory(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_uploaded_materials', JSON.stringify(newHistory));
    }
    // Optionally revoke the blob url to free up memory
    if (urlToDelete.startsWith('blob:')) {
      URL.revokeObjectURL(urlToDelete);
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
            onClick={() => setActiveTab('official')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'official'
                ? 'border-[#D0FF2A] text-[#D0FF2A]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            官方素材
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'uploads'
                ? 'border-[#D0FF2A] text-[#D0FF2A]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            我的上传
          </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Local Upload Button (Always First) */}
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
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white">
                点击上传
              </span>
            </div>

            {/* Mock Image Cards */}
            {activeTab === 'official' && mockImages.map((url, index) => (
              <div
                key={index}
                className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D0FF2A]/50 transition-all group relative bg-black/40"
                onClick={() => onSelect(url)}
              >
                <img
                  src={url}
                  alt={`Mock ${index}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/10 transition-colors" />
              </div>
            ))}

            {activeTab === 'uploads' && uploadHistory.length === 0 && (
               <div className="col-span-1 md:col-span-3 flex items-center justify-center text-gray-500 text-sm">
                 暂无上传记录
               </div>
            )}

            {activeTab === 'uploads' && uploadHistory.map((url, index) => {
              const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || (!url.startsWith('blob:') && url.match(/\.(mp4|webm)$/i));
              // Since blob urls don't have extensions, we'll assume image for now or we could store type in history if needed,
              // but standard <img> tags handle blob images well. Video would need <video>.
              // We'll just render img/video depending on a basic check, or default to img.
              return (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#D0FF2A]/50 transition-all group relative bg-black/40"
                  onClick={() => onSelect(url)}
                >
                  <img
                    src={url}
                    alt={`Upload ${index}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/10 transition-colors" />

                  {/* Delete Button (visible on hover) */}
                  <button
                    onClick={(e) => handleDeleteHistory(e, url)}
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
