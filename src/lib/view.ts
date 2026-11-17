import { displayCode, getCourse } from "./catalog";
import { buildProfilePlan, moveCourse, progress, setCompleted, swapCourse, validate } from "./engine";
import { getProfile, matchProfile, PROFILES } from "./profiles";
import type { Plan, Report } from "./types";

export interface CourseView {
  code: string;
  displayCode: string;
  title: string;
  credits: number;
  designations: string[];
  role: string;
  note?: string;
  sourceUrl: string;
  description: string;
  terms: string[];
  starred: boolean;
  bracketed: boolean;
  creditStatus: string;
  requirements: string[];
  completed: boolean;
}

export interface PlanView {
  id?: string;
  goal: string;
  profileId: string;
  title: string;
  majorName: string;
  degree: string;
  summary: string;
  why: string[];
  notes: string[];
  credits: number;
  progress: { done: number; total: number };
  semesters: Array<{
    index: number;
    label: string;
    term: string;
    credits: number;
    courses: CourseView[];
  }>;
  requirements: Report["requirements"];
  errors: Report["errors"];
  warnings: Report["warnings"];
  orgs: { name: string; category: string; why: string; sourceUrl: string }[];
  milestones: { when: string; text: string }[];
  selfStudy: { title: string; kind: string; why: string; url: string; timeline: string }[];
  alternatives: Array<{ id: string; title: string; majorName: string; degree: string; summary: string }>;
}

export function present(plan: Plan, report?: Report): PlanView {
  const profile = getProfile(plan.profileId);
  if (!profile) throw new Error(`Unknown profile ${plan.profileId}`);
  const checked = report ?? validate(plan, profile);
  return {
    goal: plan.goal,
    profileId: profile.id,
    title: profile.title,
    majorName: profile.majorName,
    degree: profile.degree,
    summary: profile.summary,
    why: profile.why,
    notes: plan.notes.filter((note) => !note.includes("could not be scheduled")),
    credits: checked.credits,
    progress: progress(plan, checked),
    semesters: plan.semesters.map((semester) => ({
      index: semester.index,
      label: semester.label,
      term: semester.term,
      credits: semester.courses.reduce((sum, course) => sum + (getCourse(course.code)?.credits ?? 0), 0),
      courses: semester.courses.map((course) => {
        const found = getCourse(course.code);
        return {
          code: course.code,
          displayCode: displayCode(course.code),
          title: found?.title ?? "Unknown course",
          credits: found?.credits ?? 0,
          designations: found?.designations ?? [],
          role: course.role,
          note: course.note,
          sourceUrl: found?.sourceUrl ?? "https://catalog.yale.edu/ycps/",
          description: found?.description ?? "",
          terms: found?.terms ?? [],
          starred: Boolean(found?.limitedEnrollmentMarker),
          bracketed: Boolean(found?.bracketedNotOfferedThisCatalogYear),
          creditStatus: found?.creditStatus ?? "unknown",
          requirements: course.requirements,
          completed: plan.completed.some((code) => code === course.code),
        };
      }),
    })),
    requirements: checked.requirements,
    errors: checked.errors,
    warnings: checked.warnings,
    orgs: profile.orgs,
    milestones: profile.milestones,
    selfStudy: profile.selfStudy,
    alternatives: profile.alternativeIds
      .map((id) => getProfile(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        majorName: item.majorName,
        degree: item.degree,
        summary: item.summary,
      })),
  };
}

export function createFromGoal(goal: string, profileId?: string): { plan: Plan; view: PlanView } {
  const profile = (profileId && getProfile(profileId)) || matchProfile(goal);
  const { plan, report } = buildProfilePlan(profile, goal);
  return { plan, view: present(plan, report) };
}

export function applyMove(plan: Plan, code: string, semester: number) {
  const profile = getProfile(plan.profileId);
  if (!profile) throw new Error("Unknown profile");
  const result = moveCourse(plan, profile, code, semester);
  return { plan: result.plan, view: present(result.plan, result.report), message: result.message };
}

export function applySwap(plan: Plan, code: string, replacement: string) {
  const profile = getProfile(plan.profileId);
  if (!profile) throw new Error("Unknown profile");
  const result = swapCourse(plan, profile, code, replacement);
  return { plan: result.plan, view: present(result.plan, result.report), message: result.message };
}

export function applyCompleted(plan: Plan, code: string, completed: boolean) {
  const next = setCompleted(plan, code, completed);
  return { plan: next, view: present(next) };
}

export function profileChoices() {
  return PROFILES.filter((profile) =>
    ["econ-consulting", "quant-sds", "premed-mcdb", "math-ba", "cs-bs"].includes(profile.id),
  ).map((profile) => ({ id: profile.id, title: profile.title, majorName: profile.majorName }));
}
