import { HeroCarousel } from "@/components/HeroCarousel";
import { GenerateVideoEngine } from "@/components/GenerateVideoEngine";

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
        <section className="container mx-auto px-4 py-12">
          <GenerateVideoEngine />
        </section>

        {/* Row 3: 1图生主图 */}
        <section className="container mx-auto px-4 py-12">
          <div className="border-2 border-dashed border-purple-500/30 bg-[#1C1C1E] rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[300px] hover:border-purple-500/60 transition-colors group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
              AI 智能白底图/场景图
            </h2>
            <p className="text-gray-400">正在建设中 / Placeholder Block</p>
          </div>
        </section>

        {/* Row 4: 4图生详情页 */}
        <section className="container mx-auto px-4 py-12">
          <div className="border-2 border-dashed border-[#D0FF2A]/30 bg-[#1C1C1E] rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[300px] hover:border-[#D0FF2A]/60 transition-colors group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-[#D0FF2A] transition-colors">
              一键生成小红书/详情页长图
            </h2>
            <p className="text-gray-400">正在建设中 / Placeholder Block</p>
          </div>
        </section>

        {/* Row 5: 实操大师班 */}
        <section className="container mx-auto px-4 py-12 pb-24">
          <div className="border-2 border-dashed border-gray-600 bg-[#1C1C1E] rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[300px] hover:border-gray-400 transition-colors group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-white transition-colors">
              30讲系统实操大师班
            </h2>
            <p className="text-gray-400">正在建设中 / Placeholder Block</p>
          </div>
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
