import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

interface Workflow {
  id: string;
  runninghubId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  creditCost: number;
}

export function WorkflowGrid({ workflows }: { workflows: Workflow[] }) {
  if (!workflows.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground">
        <p>暂无可用工作流。</p>
        <p className="text-sm">请稍后再来看看，或在后台进行配置。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="group overflow-hidden transition-all hover:shadow-lg">
          <div className="aspect-video relative overflow-hidden bg-muted">
            {workflow.coverImageUrl ? (
              <Image
                src={workflow.coverImageUrl}
                alt={workflow.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                暂无封面
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
               <Link href={`/w/${workflow.runninghubId}`}>
                 <Button size="icon" className="h-12 w-12 rounded-full" variant="secondary">
                   <Play className="h-5 w-5 ml-1" />
                 </Button>
               </Link>
            </div>
            {workflow.category && (
              <Badge className="absolute right-3 top-3 bg-black/60 hover:bg-black/80 text-white border-none backdrop-blur-md">
                {workflow.category}
              </Badge>
            )}
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="line-clamp-1 text-base">{workflow.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2 text-sm mt-1 h-10">
              {workflow.description || "暂无描述。"}
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pt-2 flex items-center justify-between border-t mt-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-primary">{Number(workflow.creditCost).toString()} 积分</span>
            </div>
            <Link href={`/w/${workflow.runninghubId}`}>
              <Button size="sm" variant="ghost">详情 →</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
