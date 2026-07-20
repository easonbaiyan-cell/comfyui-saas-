'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, UploadCloud, Loader2, X } from 'lucide-react';


export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membershipPackages, setMembershipPackages] = useState<any[]>([]);
  const [pointsTopupPackages, setPointsTopupPackages] = useState<any[]>([]);
  const [isUploadingQR, setIsUploadingQR] = useState(false);


  const [formData, setFormData] = useState({
    banner_enabled: true,
    banner_text: '',
    banner_highlight_tag: '',
    banner_discount_text: '',
    banner_countdown_end: '',
    cs_qrcode_url: '',
    cs_wechat_id: '',
    membership_packages: '',
    points_topup_packages: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setFormData({
        banner_enabled: data.banner_enabled ?? true,
        banner_text: data.banner_text || '',
        banner_highlight_tag: data.banner_highlight_tag || '',
        banner_discount_text: data.banner_discount_text || '',
        banner_countdown_end: data.banner_countdown_end ? new Date(data.banner_countdown_end).toISOString().slice(0, 16) : '',
        cs_qrcode_url: data.cs_qrcode_url || '',
        cs_wechat_id: data.cs_wechat_id || '',
        membership_packages: data.membership_packages ? JSON.stringify(data.membership_packages, null, 2) : '',
        points_topup_packages: data.points_topup_packages ? JSON.stringify(data.points_topup_packages, null, 2) : ''
      });
      setMembershipPackages(data.membership_packages || []);
      setPointsTopupPackages(data.points_topup_packages || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let membership_packages = membershipPackages;
      let points_topup_packages = pointsTopupPackages;

      const { error } = await supabase
        .from('global_settings')
        .upsert({
          id: 1,
          banner_enabled: formData.banner_enabled,
          banner_text: formData.banner_text,
          banner_highlight_tag: formData.banner_highlight_tag,
          banner_discount_text: formData.banner_discount_text,
          banner_countdown_end: formData.banner_countdown_end ? new Date(formData.banner_countdown_end).toISOString() : null,
          cs_qrcode_url: formData.cs_qrcode_url,
          cs_wechat_id: formData.cs_wechat_id,
          membership_packages: membership_packages,
          points_topup_packages: points_topup_packages,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert("保存成功!");
    } catch (error: any) {
      console.error(error);
      alert("保存失败: " + error.message);
    } finally {
      setSaving(false);
    }
  };


  const handleAddMembership = () => {
    setMembershipPackages([...membershipPackages, {
      name: '新套餐',
      current_price: 0,
      original_price: 0,
      points_per_month: 0,
      features: []
    }]);
  };

  const handleRemoveMembership = (index: number) => {
    const newPkgs = [...membershipPackages];
    newPkgs.splice(index, 1);
    setMembershipPackages(newPkgs);
  };

  const handleMembershipChange = (index: number, field: string, value: any) => {
    const newPkgs = [...membershipPackages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setMembershipPackages(newPkgs);
  };

  const handleAddFeature = (pkgIndex: number) => {
    const newPkgs = [...membershipPackages];
    if (!newPkgs[pkgIndex].features) {
      newPkgs[pkgIndex].features = [];
    }
    newPkgs[pkgIndex].features.push('新特权');
    setMembershipPackages(newPkgs);
  };

  const handleRemoveFeature = (pkgIndex: number, featureIndex: number) => {
    const newPkgs = [...membershipPackages];
    newPkgs[pkgIndex].features.splice(featureIndex, 1);
    setMembershipPackages(newPkgs);
  };

  const handleFeatureChange = (pkgIndex: number, featureIndex: number, value: string) => {
    const newPkgs = [...membershipPackages];
    newPkgs[pkgIndex].features[featureIndex] = value;
    setMembershipPackages(newPkgs);
  };


  const handleAddTopup = () => {
    setPointsTopupPackages([...pointsTopupPackages, { points: 0, price: 0 }]);
  };

  const handleRemoveTopup = (index: number) => {
    const newPkgs = [...pointsTopupPackages];
    newPkgs.splice(index, 1);
    setPointsTopupPackages(newPkgs);
  };

  const handleTopupChange = (index: number, field: string, value: number) => {
    const newPkgs = [...pointsTopupPackages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setPointsTopupPackages(newPkgs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingQR(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cs_qrcode_url: publicUrl }));
      alert('上传成功');
    } catch (error: any) {
      alert(`上传失败: ${error.message}`);
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 space-y-8 text-white max-w-4xl">
      <h1 className="text-3xl font-bold">全局设置 (Settings)</h1>

      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">顶部公告栏 (Top Banner Settings)</h2>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="banner_enabled"
            name="banner_enabled"
            checked={formData.banner_enabled}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="banner_enabled">显示公告栏 (Banner Enabled)</label>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">主文案 (Banner Text)</label>
          <input
            type="text"
            name="banner_text"
            value={formData.banner_text}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="例如: 欢迎来到 papagaga.com！"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">高亮标签 (Highlight Tag)</label>
          <input
            type="text"
            name="banner_highlight_tag"
            value={formData.banner_highlight_tag}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="例如: 首发特惠"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">优惠文案 (Discount Text)</label>
          <input
            type="text"
            name="banner_discount_text"
            value={formData.banner_discount_text}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="例如: 所有工作流 5 折"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">倒计时截止时间 (Countdown End)</label>
          <input
            type="datetime-local"
            name="banner_countdown_end"
            value={formData.banner_countdown_end}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-[250px]"
          />
        </div>
      </div>

      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">专属客服设置 (Customer Service Settings)</h2>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">客服二维码 (QR Code Image)</label>
          {formData.cs_qrcode_url ? (
            <div className="relative w-32 h-32 group">
              <img src={formData.cs_qrcode_url} alt="QR Code" className="w-full h-full object-cover rounded-md border border-gray-700" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <label className="cursor-pointer flex flex-col items-center text-xs text-white">
                  <UploadCloud className="w-5 h-5 mb-1" />
                  重新上传
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:border-primary-green hover:bg-gray-800/50 transition-colors">
              {isUploadingQR ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">点击上传</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploadingQR} />
            </label>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-400">客服微信号 (WeChat ID)</label>
          <input
            type="text"
            name="cs_wechat_id"
            value={formData.cs_wechat_id}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="WeChat ID"
          />
        </div>
      </div>

      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold">会员套餐管理 (Membership Pricing Configuration)</h2>
          <Button onClick={handleAddMembership} size="sm" className="bg-primary-green text-black hover:bg-primary-green/80 flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            新增会员套餐
          </Button>
        </div>

        {membershipPackages.map((pkg, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4 relative">
            <button
              onClick={() => handleRemoveMembership(index)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
              title="删除套餐"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">套餐名称</label>
                <input
                  type="text"
                  value={pkg.name || ''}
                  onChange={(e) => handleMembershipChange(index, 'name', e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="如: 连续包月"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">当前价格 (¥)</label>
                <input
                  type="number"
                  value={pkg.current_price || ''}
                  onChange={(e) => handleMembershipChange(index, 'current_price', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">原价 (¥)</label>
                <input
                  type="number"
                  value={pkg.original_price || ''}
                  onChange={(e) => handleMembershipChange(index, 'original_price', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-400">每月赠送积分</label>
                <input
                  type="number"
                  value={pkg.points_per_month || ''}
                  onChange={(e) => handleMembershipChange(index, 'points_per_month', Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">特权列表 (Features)</label>
                <Button onClick={() => handleAddFeature(index)} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-7 text-xs px-2">
                  <Plus className="w-3 h-3 mr-1" />
                  添加特权
                </Button>
              </div>
              {pkg.features && pkg.features.map((feature: string, fIndex: number) => (
                <div key={fIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-1.5 text-sm text-white"
                  />
                  <button onClick={() => handleRemoveFeature(index, fIndex)} className="text-gray-500 hover:text-red-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!pkg.features || pkg.features.length === 0) && (
                <p className="text-xs text-gray-500 italic">暂无特权</p>
              )}
            </div>
          </div>
        ))}
        {membershipPackages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">暂无套餐，请点击右上角添加。</p>
        )}
      </div>

      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold">积分充值包管理 (Points Top-up Packages)</h2>
          <Button onClick={handleAddTopup} size="sm" className="bg-primary-green text-black hover:bg-primary-green/80 flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            新增充值档位
          </Button>
        </div>

        <div className="space-y-2">
          {pointsTopupPackages.map((pkg, index) => (
            <div key={index} className="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <div className="flex-1 flex items-center space-x-2">
                <label className="text-sm text-gray-400 w-16">积分数量</label>
                <input
                  type="number"
                  value={pkg.points || ''}
                  onChange={(e) => handleTopupChange(index, 'points', Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <label className="text-sm text-gray-400 w-16">售价 (¥)</label>
                <input
                  type="number"
                  value={pkg.price || ''}
                  onChange={(e) => handleTopupChange(index, 'price', Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                />
              </div>
              <button onClick={() => handleRemoveTopup(index)} className="text-gray-500 hover:text-red-400 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {pointsTopupPackages.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">暂无充值档位，请点击右上角添加。</p>
          )}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-primary-green text-black hover:bg-primary-green/80">
        {saving ? '保存中...' : '保存更改 (Save)'}
      </Button>
    </div>
  );
}
