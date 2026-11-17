import { randomUUID } from "crypto";
import { z } from "zod";
import { savePlan } from "@/lib/store";
import { createFromGoal } from "@/lib/view";

const Body = z.object({
  goal: z.string().trim().min(3).max(2000),
  profileId: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Describe a goal in a sentence or two." }, { status: 400 });
  }
  const { plan, view } = createFromGoal(parsed.data.goal, parsed.data.profileId);
  const id = randomUUID();
  savePlan(id, plan);
  return Response.json({ ...view, id });
}
