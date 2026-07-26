'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { getAllOfficialMaterials, uploadOfficialMaterial, deleteOfficialMaterial } from '@/actions/officialMaterials';

// Use anon key for storage uploads directly from client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('node_0');
  const [type, setType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getAllOfficialMaterials();
      setMaterials(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${category}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('official_materials')
        .upload(filePath, file);

      if (error) {
        console.error('Storage upload error:', error);
        alert('上传失败: ' + error.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('official_materials')
        .getPublicUrl(filePath);

      const res = await uploadOfficialMaterial({
        category,
        type,
        url: publicUrlData.publicUrl
      });

      if (res.success) {
        fetchMaterials();
      } else {
        alert('保存数据库失败: ' + res.error);
      }

    } catch (err: any) {
      console.error(err);
      alert('上传异常: ' + err.message);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploading(false);
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('确定要删除这个素材吗？')) return;

    // extract file path from url if possible
    const pathMatch = url.match(/\/official_materials\/(.*)$/);
    if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        await supabase.storage.from('official_materials').remove([filePath]);
    }

    const res = await deleteOfficialMaterial(id);
    if (res.success) {
      fetchMaterials();
    } else {
      alert('删除失败: ' + res.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">官方素材管理</h1>

      {/* Upload Section */}
      <div className="bg-[#1C1C1E] rounded-xl p-6 mb-8 border border-white/5">
        <h2 className="text-lg font-medium text-white mb-4">上传新素材</h2>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col gap-2 w-full md:w-48">
            <label className="text-sm text-gray-400">所属节点 (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D0FF2A] transition-colors"
            >
              <option value="node_0">node_0 (原图/模特)</option>
              <option value="node_1">node_1 (姿势参考)</option>
              <option value="node_2">node_2 (视频参考)</option>
              <option value="node_3">node_3 (其他)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-48">
            <label className="text-sm text-gray-400">素材类型 (Type)</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'image' | 'video')}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D0FF2A] transition-colors"
            >
              <option value="image">图片 (Image)</option>
              <option value="video">视频 (Video)</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
              />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="bg-[#D0FF2A] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#b8e61b] transition-colors disabled:opacity-50 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上传中...' : '选择文件上传'}
            </button>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">已上传素材</h2>

        {loading ? (
          <div className="text-gray-400">加载中...</div>
        ) : materials.length === 0 ? (
          <div className="text-gray-400 bg-[#1C1C1E] p-8 rounded-xl text-center border border-white/5">
            暂无素材，请上传
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {materials.map((m) => (
              <div key={m.id} className="bg-[#1C1C1E] rounded-xl overflow-hidden border border-white/5 group relative">
                <div className="aspect-[3/4] relative bg-black/50">
                  {m.type === 'video' ? (
                     <video src={m.url} className="w-full h-full object-cover" muted loop playsInline />
                  ) : (
                     <img src={m.url} alt="Material" className="w-full h-full object-cover" />
                  )}

                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-sm flex items-center gap-1">
                    {m.type === 'video' ? <Video className="w-3 h-3"/> : <ImageIcon className="w-3 h-3"/>}
                    {m.category}
                  </div>

                  <button
                    onClick={() => handleDelete(m.id, m.url)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors z-10 backdrop-blur-md opacity-0 group-hover:opacity-100"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
