import raw from "../../data/catalog/courses.json";

export interface CatalogCourse {
  code: string;
  subject: string;
  number: number;
  title: string;
  terms: Array<"fall" | "spring">;
  limitedEnrollmentMarker: boolean;
  bracketedNotOfferedThisCatalogYear: boolean;
  description: string;
  instructor: string;
  designations: string[];
  credits: number;
  creditStatus: string;
  printedCredit: string | null;
  hasPrerequisiteLanguage: boolean;
  sourceUrl: string;
  catalogYear: string;
  aliases: string[];
}

const courses = raw.courses as CatalogCourse[];
const aliases = raw.aliases as Record<string, string>;

const byCode = new Map<string, CatalogCourse>();
for (const course of courses) byCode.set(course.code, course);

export const CATALOG_YEAR = raw.catalogYear;
export const CATALOG_SOURCE = raw.source;

export function canonical(code: string): string {
  return aliases[code] ?? code;
}

export function getCourse(code: string): CatalogCourse | undefined {
  return byCode.get(canonical(code));
}

export function allCourses(): CatalogCourse[] {
  return courses;
}

export function displayCode(code: string): string {
  const course = getCourse(code);
  if (!course) return code;
  const names = [course.code, ...course.aliases];
  return names.join(" / ");
}

export function relatedCodes(code: string): string[] {
  const course = getCourse(code);
  if (!course) return [canonical(code)];
  return [course.code, ...course.aliases];
}

export function sameCourse(a: string, b: string): boolean {
  return canonical(a) === canonical(b);
}
