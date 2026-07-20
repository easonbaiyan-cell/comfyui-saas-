'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let membership_packages = [];
      let points_topup_packages = [];

      try {
        membership_packages = formData.membership_packages ? JSON.parse(formData.membership_packages) : [];
        points_topup_packages = formData.points_topup_packages ? JSON.parse(formData.points_topup_packages) : [];
      } catch (e) {
        alert("JSON parse error, please check the format of JSON fields.");
        setSaving(false);
        return;
      }

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
          <label className="text-sm text-gray-400">客服二维码URL (QR Code URL)</label>
          <input
            type="text"
            name="cs_qrcode_url"
            value={formData.cs_qrcode_url}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            placeholder="https://..."
          />
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
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">会员套餐管理 (Membership Pricing Configuration)</h2>
        <p className="text-xs text-gray-500">JSON Format Array</p>
        <textarea
          name="membership_packages"
          value={formData.membership_packages}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white h-48 font-mono text-sm"
        />
      </div>

      <div className="space-y-4 border border-gray-700 p-6 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">积分充值包管理 (Points Top-up Packages)</h2>
        <p className="text-xs text-gray-500">JSON Format Array</p>
        <textarea
          name="points_topup_packages"
          value={formData.points_topup_packages}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white h-48 font-mono text-sm"
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-primary-green text-black hover:bg-primary-green/80">
        {saving ? '保存中...' : '保存更改 (Save)'}
      </Button>
    </div>
  );
}
