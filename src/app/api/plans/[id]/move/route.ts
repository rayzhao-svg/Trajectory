import { z } from "zod";
import { readPlan, savePlan } from "@/lib/store";
import { applyMove } from "@/lib/view";

const Body = z.object({
  code: z.string().min(3),
  semester: z.number().int().min(0).max(7),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const plan = readPlan(id);
  if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Choose a course and a term." }, { status: 400 });
  const result = applyMove(plan, parsed.data.code, parsed.data.semester);
  savePlan(id, result.plan);
  return Response.json({ ...result.view, id, message: result.message });
}
