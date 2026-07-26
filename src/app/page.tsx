import { HeroCarousel } from "@/components/HeroCarousel";
import { GenerateVideoEngine } from "@/components/GenerateVideoEngine";
import { GenerateImageEngine } from "@/components/GenerateImageEngine";
import { GenerateDetailsEngine } from "@/components/GenerateDetailsEngine";

import { MasterclassSection } from "@/components/MasterclassSection";
export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white selection:bg-[#D0FF2A] selection:text-black">

      <main className="flex-1">
        {/* Row 1: 首屏滚动区 */}
        <section className="w-full">
          <HeroCarousel />
        </section>

        {/* Row 2: 核心变现引擎 */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <GenerateVideoEngine />
        </section>

        {/* Row 3: 1图生主图 */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <GenerateImageEngine />
        </section>

        {/* Row 4: 4图生详情页 */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <GenerateDetailsEngine />
        </section>

        {/* Row 5: 实操大师班 */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 pb-24">
          <MasterclassSection />
        </section>
      </main>

      <footer className="border-t border-gray-800 py-6 md:py-8 bg-black">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} papagaga. 版权所有。
          </p>
        </div>
      </footer>
    </div>
  );
}
