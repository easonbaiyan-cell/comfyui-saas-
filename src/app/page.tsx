import { PromoBanner } from "@/components/PromoBanner";
import { Header } from "@/components/Header";
import { WorkflowGrid } from "@/components/WorkflowGrid";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Try to fetch settings, handle the case where DB is empty or fails gracefully
  let siteSettings = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  const params = await searchParams;
  const sortMode = Array.isArray(params.sort) ? params.sort[0] : params.sort || 'newest';

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

        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (catsData) {
            categories = catsData.map(c => ({
              id: c.id,
              name: c.name,
              requiredTier: c.required_tier
            }));
        }

        let query = supabase.from('workflows').select('*').eq('status', 'published');

        // Always keep pinned workflows at the top
        query = query.order('is_pinned', { ascending: false });

        if (sortMode === 'recommended') {
          query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
        } else if (sortMode === 'hottest') {
          query = query.order('usage_count', { ascending: false }).order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data: wfs } = await query;

        if (wfs) {
            // Transform Decimal to number for the UI component
            workflows = wfs.map(w => ({
              id: w.id,
              runninghubId: w.runninghub_id || w.r_app_id || "",
              title: w.title,
              description: w.description,
              coverImageUrl: w.cover_image_url || w.cover_url || null,
              referenceVideoUrl: w.reference_video_url || w.video_url || null,
              virtualPlatform: w.virtual_platform || null,
              virtualLikes: w.virtual_likes || 0,
              category: w.category,
              creditCost: w.points_cost !== undefined ? Number(w.points_cost) : (w.credit_cost ? Number(w.credit_cost) : 0),
              isActive: w.is_active !== undefined ? w.is_active : (w.status === 'published'),
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

  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner text={bannerText} countdownUntil={bannerCountdown as Date} />
      <Header logoUrl={logoUrl} navLinks={navLinks} />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-6" id="workflows">
          <div className="mb-4 flex space-x-4">
            <a href="/?sort=newest#workflows" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortMode === 'newest' ? 'bg-primary-green text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              最新 (Newest)
            </a>
            <a href="/?sort=recommended#workflows" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortMode === 'recommended' ? 'bg-primary-green text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              推荐 (Recommended)
            </a>
            <a href="/?sort=hottest#workflows" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortMode === 'hottest' ? 'bg-primary-green text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              最热 (Hottest)
            </a>
          </div>
          <WorkflowGrid workflows={workflows} categories={categories} />
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
