import { WorkflowGrid } from "@/components/WorkflowGrid";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Try to fetch settings, handle the case where DB is empty or fails gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);


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

        const { data: wfs } = await supabase
          .from('workflows')
          .select('*')
          .eq('status', 'published')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

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

    return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">
        <section className="container mx-auto px-4 py-6" id="workflows">
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
