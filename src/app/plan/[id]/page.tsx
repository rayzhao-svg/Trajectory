import { PlanWorkspace } from "@/components/PlanWorkspace";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanWorkspace id={id} />;
}
