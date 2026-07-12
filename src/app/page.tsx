import { PromoBanner } from "@/components/PromoBanner";
import { Header } from "@/components/Header";
import { WorkflowGrid } from "@/components/WorkflowGrid";
import prisma from "@/lib/prisma";

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function Home() {
  // Try to fetch settings, handle the case where DB is empty or fails gracefully
  let siteSettings = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workflows: any[] = [];

  try {
    const settings = await prisma.siteSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });
    siteSettings = settings;
    
    const wfs = await prisma.workflow.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    // Transform Decimal to number for the UI component
    workflows = wfs.map(w => ({
      ...w,
      creditCost: w.creditCost ? Number(w.creditCost) : 0
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    // Continue with defaults if DB fails
  }

  // Fallbacks if nothing in DB yet
  const bannerText = siteSettings?.topBannerText || "Welcome to papagaga.com! Launch Offer: 50% off all workflows.";
  // Stable date if missing (prevent hydration mismatches and impure function errors)
  const defaultFutureDate = new Date();
  defaultFutureDate.setDate(defaultFutureDate.getDate() + 7);
  const bannerCountdown = siteSettings?.topBannerCountdown || defaultFutureDate;
  const logoUrl = siteSettings?.logoUrl || undefined;
  
  // Parse navLinks from JSONB
  let navLinks = [];
  try {
    if (siteSettings?.navLinks) {
      navLinks = typeof siteSettings.navLinks === 'string' 
        ? JSON.parse(siteSettings.navLinks) 
        : siteSettings.navLinks;
    }
  } catch (e) {
    console.error("Error parsing nav links", e);
  }

  if (navLinks.length === 0) {
    navLinks = [
      { label: "Workflows", type: "redirect", url: "/#workflows" },
      { label: "Pricing", type: "modal", content: "Pricing modal content: Workflows cost 1.5x base runninghub credits." },
      { label: "About", type: "redirect", url: "/about" },
    ];
  }

  // Dummy fallback workflows if DB is totally empty
  if (workflows.length === 0) {
    workflows = [
      {
        id: "1",
        runninghubId: "123",
        title: "FLUX.1 Pro Generator",
        description: "High-quality image generation using FLUX.1 Pro model.",
        coverImageUrl: "https://images.unsplash.com/photo-1698428800057-0a373b53a067?q=80&w=600&auto=format&fit=crop",
        category: "Image",
        creditCost: 15
      },
      {
        id: "2",
        runninghubId: "456",
        title: "Video Upscaler 4K",
        description: "Upscale your videos to 4K resolution with AI.",
        coverImageUrl: "https://images.unsplash.com/photo-1695653422960-4c3112bd22fa?q=80&w=600&auto=format&fit=crop",
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
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight" id="workflows">Featured Workflows</h1>
            <p className="text-muted-foreground">
              Discover and run the latest AI workflows.
            </p>
          </div>
          
          <WorkflowGrid workflows={workflows} />
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} papagaga. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
