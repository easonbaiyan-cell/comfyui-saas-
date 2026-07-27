import { HeroCarousel } from "@/components/HeroCarousel";
import { WorkflowGenerateBlock } from "@/components/WorkflowGenerateBlock";

import { MasterclassSection } from "@/components/MasterclassSection";
import { supabase } from "@/lib/supabase";
export const dynamic = 'force-dynamic';



export default async function Home() {

  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('status', 'published');

  if (error) {
    console.error("Error fetching workflows:", error);
  }

  const { data: settingsData, error: settingsError } = await supabase
    .from('global_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (settingsError) {
    console.error("Error fetching global settings:", settingsError);
  }



  const mockWorkflow = {
    id: 'mock-1',
    title: 'Mock Workflow',
    description: 'Mock Description',
    rh_payload_template: {
      nodeInfoList: [
        {
          nodeId: 'node1',
          description: '包含模特的图片',
          fieldName: 'image',
          type: 'image'
        }
      ]
    },
    cost_points: 10
  };
  const workflowsList = (!workflows || workflows.length === 0) ? [mockWorkflow] : workflows;


  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white selection:bg-[#D0FF2A] selection:text-black">

      <main className="flex-1">
        {/* Row 1: 首屏滚动区 */}
        <section className="w-full">
          <HeroCarousel bannerSettings={settingsData} />
        </section>

        {/* Row 2: 核心变现引擎 */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {workflowsList.map((workflow, index) => (
            <div key={workflow.id} className={index !== workflowsList.length - 1 ? 'mb-24' : ''}>
              <WorkflowGenerateBlock workflow={workflow} />
            </div>
          ))}
        </section>

        {/* Row 3: 1图生主图 (Placeholder or next workflow) */}

        {/* Row 4: 4图生详情页 (Placeholder or next workflow) */}

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
