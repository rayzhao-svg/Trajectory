import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PlanView } from "./view";

export async function renderPlanPdf(view: PlanView): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 750;
  const draw = (text: string, size = 11, heavy = false) => {
    const face = heavy ? bold : font;
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (face.widthOfTextAtSize(next, size) > 520) {
        if (line) lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    for (const item of lines) {
      if (y < 56) {
        page = doc.addPage([612, 792]);
        y = 750;
      }
      page.drawText(item, { x: 48, y, size, font: face, color: rgb(0.1, 0.1, 0.1) });
      y -= size + 5;
    }
  };

  draw("Trajectory", 20, true);
  draw(view.title, 14, true);
  draw(`${view.majorName}, ${view.degree} · ${view.credits} credits`, 11);
  y -= 6;
  draw(view.goal, 11);
  y -= 8;
  draw("Future sections are not confirmed. This plan uses Yale College Programs of Study 2026–2027.", 9);
  y -= 10;
  for (const semester of view.semesters) {
    draw(`${semester.label} · ${semester.credits} credits`, 12, true);
    for (const course of semester.courses) {
      draw(`${course.displayCode}  ${course.title}  (${course.credits})`, 10);
    }
    y -= 6;
  }
  y -= 8;
  draw("Requirements", 14, true);
  for (const requirement of view.requirements) {
    draw(`${requirement.status.toUpperCase()}  ${requirement.label}`, 10, true);
    draw(requirement.detail, 9);
  }
  return doc.save();
}
