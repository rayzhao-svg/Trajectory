import { readPlan } from "@/lib/store";
import { renderPlanPdf } from "@/lib/pdf";
import { present } from "@/lib/view";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const plan = readPlan(id);
  if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
  const bytes = await renderPlanPdf({ ...present(plan), id });
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="trajectory-${id.slice(0, 8)}.pdf"`,
    },
  });
}
