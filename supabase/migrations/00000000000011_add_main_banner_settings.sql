ALTER TABLE public.global_settings
ADD COLUMN main_banner_bg_image TEXT DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
ADD COLUMN main_banner_top_tag TEXT DEFAULT 'PAPAGAGA 商业级应用',
ADD COLUMN main_banner_title_1 TEXT DEFAULT '1人超级AI公司',
ADD COLUMN main_banner_title_2 TEXT DEFAULT '小白轻松掌控带货全闭环',
ADD COLUMN main_banner_description TEXT DEFAULT '颠覆传统电商模式，以极低门槛重塑内容生产力。从零基础到爆款视频，用 AI 构建属于超级个体的自动化印钞机。',
ADD COLUMN main_banner_metric_1_value TEXT DEFAULT '30',
ADD COLUMN main_banner_metric_1_label TEXT DEFAULT '节实战课程',
ADD COLUMN main_banner_metric_2_value TEXT DEFAULT '4步',
ADD COLUMN main_banner_metric_2_label TEXT DEFAULT '极简工作流',
ADD COLUMN main_banner_metric_3_value TEXT DEFAULT '25%',
ADD COLUMN main_banner_metric_3_label TEXT DEFAULT '最高分销佣金';
