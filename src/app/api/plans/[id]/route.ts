import { readPlan } from "@/lib/store";
import { present } from "@/lib/view";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const plan = readPlan(id);
  if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
  return Response.json({ ...present(plan), id });
}
