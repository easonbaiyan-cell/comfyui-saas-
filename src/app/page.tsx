import { PromoBanner } from "@/components/PromoBanner";
import { Header } from "@/components/Header";
import { WorkflowGrid } from "@/components/WorkflowGrid";
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function Home() {
  // Try to fetch settings, handle the case where DB is empty or fails gracefully
  let siteSettings = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];

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

        const { data: wfs } = await supabase
          .from('workflows')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (wfs) {
            // Transform Decimal to number for the UI component
            workflows = wfs.map(w => ({
              id: w.id,
              runninghubId: w.runninghub_id,
              title: w.title,
              description: w.description,
              coverImageUrl: w.cover_image_url,
              category: w.category,
              creditCost: w.credit_cost ? Number(w.credit_cost) : 0,
              isActive: w.is_active,
              createdAt: w.created_at,
              updatedAt: w.updated_at
            }));
        }
    }
  } catch (error) {
    console.error("Error fetching data from Supabase:", error);
    // Continue with defaults if DB fails
  }

  // Fallbacks if nothing in DB yet
  const bannerText = siteSettings?.top_banner_text || "欢迎来到 papagaga.com！首发特惠：所有工作流 5 折。";
  // Stable date if missing (prevent hydration mismatches and impure function errors)
  const defaultFutureDate = new Date();
  defaultFutureDate.setDate(defaultFutureDate.getDate() + 7);
  const bannerCountdown = siteSettings?.top_banner_countdown ? new Date(siteSettings.top_banner_countdown) : defaultFutureDate;
  const logoUrl = siteSettings?.logo_url || undefined;
  
  // Parse navLinks from JSONB
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

  // Dummy fallback workflows if DB is totally empty
  if (workflows.length === 0) {
    workflows = [
      {
        id: "1",
        runninghubId: "123",
        title: "FLUX.1 Pro Generator",
        description: "使用 FLUX.1 Pro 模型生成高质量图像。",
        coverImageUrl: "https://picsum.photos/600/800?random=1",
        category: "Image",
        creditCost: 15
      },
      {
        id: "2",
        runninghubId: "456",
        title: "Video Upscaler 4K",
        description: "使用 AI 将您的视频提升至 4K 分辨率。",
        coverImageUrl: "https://picsum.photos/600/800?random=2",
        category: "Video",
        creditCost: 45
      }
    ];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner text={bannerText} countdownUntil={bannerCountdown as Date} />
      <Header logoUrl={logoUrl} navLinks={navLinks} />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-6" id="workflows">
          <WorkflowGrid workflows={workflows} />
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} papagaga. 版权所有。
          </p>
        </div>
      </footer>
    </div>
  );
}
