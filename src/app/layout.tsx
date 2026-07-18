import type { Metadata } from 'next';
import './globals.css';
import { PromoBanner } from "@/components/PromoBanner";
import { Header } from "@/components/Header";
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'papagaga',
  description: 'ComfyUI Workflow SaaS',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteSettings = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        siteSettings = settingsData;
    }
  } catch (error) {
    console.error("Error fetching data from Supabase:", error);
  }

  const bannerText = siteSettings?.top_banner_text || "欢迎来到 papagaga.com！首发特惠：所有工作流 5 折。";
  const defaultFutureDate = new Date();
  defaultFutureDate.setDate(defaultFutureDate.getDate() + 7);
  const bannerCountdown = siteSettings?.top_banner_countdown ? new Date(siteSettings.top_banner_countdown) : defaultFutureDate;
  const logoUrl = siteSettings?.logo_url || undefined;

  let navLinks = [];
  try {
    if (siteSettings?.nav_links) {
      navLinks = typeof siteSettings.nav_links === 'string'
        ? JSON.parse(siteSettings.nav_links)
        : siteSettings.nav_links;
    }
  } catch (e) {
    console.error("Error parsing nav links", e);
  }

  if (navLinks.length === 0) {
    navLinks = [
      { label: "工作流", type: "redirect", url: "/#workflows" },
      { label: "定价", type: "modal", content: "定价 modal content: 工作流 cost 1.5x base runninghub credits." },
      { label: "关于", type: "redirect", url: "/about" },
    ];
  }

  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`bg-background text-foreground min-h-screen antialiased`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif' }}
      >
        <PromoBanner text={bannerText} countdownUntil={bannerCountdown as Date} />
        <Header logoUrl={logoUrl} navLinks={navLinks} />
        {children}
      </body>
    </html>
  );
}
