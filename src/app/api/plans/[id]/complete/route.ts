import { z } from "zod";
import { readPlan, savePlan } from "@/lib/store";
import { applyCompleted } from "@/lib/view";

const Body = z.object({
  code: z.string().min(3),
  completed: z.boolean(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const plan = readPlan(id);
  if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Missing course." }, { status: 400 });
  const result = applyCompleted(plan, parsed.data.code, parsed.data.completed);
  savePlan(id, result.plan);
  return Response.json({ ...result.view, id });
}
