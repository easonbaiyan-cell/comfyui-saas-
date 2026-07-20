CREATE TABLE IF NOT EXISTS public.global_settings (
  id INT PRIMARY KEY DEFAULT 1,
  banner_enabled BOOLEAN DEFAULT true,
  banner_text TEXT DEFAULT '欢迎来到 papagaga.com！',
  banner_highlight_tag TEXT DEFAULT '首发特惠',
  banner_discount_text TEXT DEFAULT '所有工作流 5 折',
  banner_countdown_end TIMESTAMP WITH TIME ZONE,
  cs_qrcode_url TEXT,
  cs_wechat_id TEXT,
  membership_packages JSONB DEFAULT '[{"id": 1, "price": 1280, "original_price": 1680, "title": "基础包月", "points_per_month": 72000, "features": ["无自动续费", "1积分=0.018元", "每月生成约180个视频", "每个视频约7元"]}, {"id": 2, "price": 680, "original_price": 1280, "title": "连续包月", "points_per_month": 72000, "features": ["每月自动扣费，可随时取消", "1积分=0.009元", "每月生成约180个视频", "每个视频约3.7元"]}, {"id": 3, "price": 6800, "original_price": 15360, "title": "连续包年", "points_per_month": 72000, "features": ["每年自动扣费，可随时取消", "1积分=0.007元", "相当于买10个月送2个月", "每月生成约180个视频"]}]'::jsonb,
  points_topup_packages JSONB DEFAULT '[{"id": "tier-1", "points": 1000, "price": 10}, {"id": "tier-2", "points": 2000, "price": 20}, {"id": "tier-3", "points": 5000, "price": 50}, {"id": "tier-4", "points": 10000, "price": 100}, {"id": "tier-5", "points": 20000, "price": 200}, {"id": "tier-6", "points": 50000, "price": 500}]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on global_settings"
  ON public.global_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated update on global_settings"
  ON public.global_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on global_settings"
  ON public.global_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.global_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
