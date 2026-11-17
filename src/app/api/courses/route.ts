import { allCourses, displayCode } from "@/lib/catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (query.length < 2) return Response.json({ courses: [] });
  const courses = allCourses()
    .filter((course) => {
      const haystack = `${course.code} ${course.aliases.join(" ")} ${course.title}`.toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 12)
    .map((course) => ({
      code: course.code,
      displayCode: displayCode(course.code),
      title: course.title,
      credits: course.credits,
      terms: course.terms,
    }));
  return Response.json({ courses });
}
