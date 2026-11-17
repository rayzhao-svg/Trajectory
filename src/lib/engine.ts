import {
  allCourses,
  canonical,
  displayCode,
  getCourse,
  relatedCodes,
  sameCourse,
  type CatalogCourse,
} from "./catalog";
import { PLACEMENT_EXAM, exclusiveConflict, exprSatisfied, prereqFor } from "./prereqs";
import type {
  Issue,
  Plan,
  PlannedCourse,
  Profile,
  Report,
  RequirementResult,
  Role,
  Semester,
  Slot,
  Term,
} from "./types";

export const START_YEAR = 2027;
const MAX_CREDITS = 5.5;
const MIN_CREDITS = 4;
const TARGET_CREDITS = 36;
const FIRST_YEAR_SUBJECT_CAP = 4;

const BREADTH_SUBJECTS = new Set([
  "HIST",
  "HSAR",
  "PHIL",
  "PLSC",
  "ENGL",
  "SOCY",
  "HUMS",
  "AMST",
  "CLCV",
  "CLSS",
  "FILM",
  "MUSI",
  "RLST",
  "WGSS",
]);

const AREA_NEED: Record<string, number> = { HU: 2, SO: 2, SC: 2, QR: 2, WR: 2 };
const DESIGNATION_PRIORITY = ["L4", "L5", "L3", "L2", "L1", "WR", "QR", "HU", "SO", "SC"];

function termOf(index: number): Term {
  return index % 2 === 0 ? "fall" : "spring";
}

function labelOf(index: number, startYear: number): string {
  const term = termOf(index);
  const year = startYear + Math.floor((index + (term === "spring" ? 1 : 0)) / 2);
  const academicYear = Math.floor(index / 2) + 1;
  return `Year ${academicYear} · ${term === "fall" ? "Fall" : "Spring"} ${year}`;
}

function emptySemesters(startYear: number): Semester[] {
  return Array.from({ length: 8 }, (_, index) => ({
    index,
    term: termOf(index),
    label: labelOf(index, startYear),
    courses: [],
  }));
}

function creditsOf(semester: Semester): number {
  return semester.courses.reduce((sum, course) => sum + (getCourse(course.code)?.credits ?? 0), 0);
}

function usedCodes(plan: Plan): Set<string> {
  const used = new Set<string>();
  for (const semester of plan.semesters) {
    for (const course of semester.courses) {
      for (const code of relatedCodes(course.code)) used.add(canonical(code));
    }
  }
  return used;
}

function subjectCredits(plan: Plan, subject: string, indexes: number[]): number {
  let total = 0;
  for (const index of indexes) {
    for (const course of plan.semesters[index].courses) {
      const found = getCourse(course.code);
      if (found?.subject === subject) total += found.credits;
    }
  }
  return total;
}

function earlierAndCurrent(plan: Plan, semesterIndex: number): { earlier: Set<string>; same: Set<string> } {
  const earlier = new Set<string>([PLACEMENT_EXAM, ...plan.placements.map(canonical)]);
  const same = new Set<string>();
  for (const semester of plan.semesters) {
    const target = semester.index < semesterIndex ? earlier : semester.index === semesterIndex ? same : null;
    if (!target) continue;
    for (const course of semester.courses) {
      for (const code of relatedCodes(course.code)) target.add(canonical(code));
    }
  }
  for (const code of plan.placements) earlier.add(canonical(code));
  return { earlier, same };
}

function canPlace(plan: Plan, slot: Slot, index: number): string | null {
  const course = getCourse(slot.code);
  if (!course) return `${slot.code} is not in the 2026–2027 course list.`;
  if (slot.senior && index < 6) return "Senior requirement courses stay in the senior year.";
  if (course.terms.length > 0 && !course.terms.includes(termOf(index))) {
    return `${displayCode(course.code)} is listed for ${course.terms.join(" and ")}, not ${termOf(index)}.`;
  }
  const nextCredits = creditsOf(plan.semesters[index]) + course.credits;
  if (nextCredits > MAX_CREDITS + 1e-9) return "That term would exceed 5.5 credits.";
  if (index < 2) {
    const projected = subjectCredits(plan, course.subject, [0, 1]) + course.credits;
    if (projected > FIRST_YEAR_SUBJECT_CAP + 1e-9) {
      return `First-year rules allow at most 4 credits in ${course.subject} across the first two terms.`;
    }
  }
  const { earlier, same } = earlierAndCurrent(plan, index);
  const expr = prereqFor(course.code);
  if (expr && !exprSatisfied(expr, earlier, same)) {
    return `${displayCode(course.code)} still has an unmet prerequisite.`;
  }
  const scheduled = plan.semesters.flatMap((semester) => semester.courses.map((item) => item.code));
  const conflict = exclusiveConflict([...scheduled, course.code]);
  if (conflict) return `${conflict.join(" and ")} cannot both be taken.`;
  return null;
}

function placeSlot(plan: Plan, slot: Slot): string | null {
  const course = getCourse(slot.code);
  if (!course) return `${slot.code} is not in the parsed 2026–2027 catalog.`;
  if (usedCodes(plan).has(canonical(course.code))) return null;
  const start = slot.senior ? 6 : 0;
  let reason = "No term had room.";
  for (let index = start; index < 8; index += 1) {
    const blocked = canPlace(plan, slot, index);
    if (!blocked) {
      plan.semesters[index].courses.push(toPlanned(slot));
      return null;
    }
    reason = blocked;
  }
  return `${displayCode(course.code)} could not be scheduled. ${reason}`;
}

function toPlanned(slot: Slot): PlannedCourse {
  return {
    code: canonical(slot.code),
    role: slot.role,
    requirements: slot.requirements,
    senior: slot.senior,
    note: slot.note,
  };
}

function isHeavy(course: CatalogCourse): boolean {
  if (["CHEM 2200", "PHYS 1700", "PHYS 1710", "MB&B 3000", "MB&B 3010", "MB&B 2750"].includes(course.code)) {
    return true;
  }
  if (["MATH", "CPSC", "MCDB", "MB&B"].includes(course.subject) && course.number >= 2500) return true;
  return false;
}

function breadthBias(profileId: string, code: string): number {
  let hash = 0;
  const text = `${profileId}:${code}`;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 33 + text.charCodeAt(index)) >>> 0;
  return (hash % 100) / 50;
}

function breadthCandidate(course: CatalogCourse): boolean {
  if (course.credits !== 1) return false;
  if (course.limitedEnrollmentMarker || course.bracketedNotOfferedThisCatalogYear) return false;
  if (course.hasPrerequisiteLanguage) return false;
  if (course.terms.length === 0) return false;
  if (course.number >= 2500) return false;
  if (/senior|independent|directed|thesis|essay|laboratory|lab\b/i.test(course.title)) return false;
  if (course.code.endsWith("L")) return false;
  return BREADTH_SUBJECTS.has(course.subject);
}

function assignDesignations(plan: Plan): Record<string, string[]> {
  const need: Record<string, number> = { ...AREA_NEED, L4: 1 };
  const used: Record<string, string[]> = {};
  for (const key of Object.keys(need)) used[key] = [];
  const assigned = new Map<string, string>();

  const courses = plan.semesters.flatMap((semester) =>
    semester.courses.flatMap((item) => {
      const course = getCourse(item.code);
      return course ? [course] : [];
    }),
  );

  const claim = (course: CatalogCourse, key: string) => {
    if ((used[key]?.length ?? 0) >= need[key]) return false;
    if (!course.designations.includes(key)) return false;
    if (assigned.has(course.code)) return false;
    assigned.set(course.code, key);
    used[key].push(course.code);
    return true;
  };

  for (const key of DESIGNATION_PRIORITY) {
    for (const course of courses) claim(course, key);
  }

  for (const key of Object.keys(need)) {
    while ((used[key]?.length ?? 0) < need[key]) {
      const donor = courses.find((course) => {
        const current = assigned.get(course.code);
        return current && course.designations.includes(key) && (used[current]?.length ?? 0) > need[current];
      });
      if (!donor) break;
      const current = assigned.get(donor.code)!;
      used[current] = used[current].filter((code) => code !== donor.code);
      assigned.set(donor.code, key);
      used[key].push(donor.code);
    }
  }
  return used;
}

function refill(plan: Plan) {
  const guard = 80;
  for (let step = 0; step < guard; step += 1) {
    const total = plan.semesters.reduce((sum, semester) => sum + creditsOf(semester), 0);
    const short = plan.semesters.filter((semester) => creditsOf(semester) + 1e-9 < MIN_CREDITS);
    if (total + 1e-9 >= TARGET_CREDITS && short.length === 0) return;
    const designations = assignDesignations(plan);
    const unmet = new Set(
      Object.entries({ ...AREA_NEED, L4: 1 })
        .filter(([key, count]) => (designations[key]?.length ?? 0) < count)
        .map(([key]) => key),
    );
    const used = usedCodes(plan);
    let best: { course: CatalogCourse; index: number; score: number } | null = null;
    for (const course of allCourses()) {
      if (!breadthCandidate(course) || used.has(course.code)) continue;
      for (const semester of plan.semesters) {
        if (!course.terms.includes(semester.term)) continue;
        if (creditsOf(semester) + course.credits > MAX_CREDITS + 1e-9) continue;
        const subjectCount = semester.courses.filter((item) => getCourse(item.code)?.subject === course.subject).length;
        if (subjectCount >= 2) continue;
        if (semester.index < 2 && subjectCredits(plan, course.subject, [0, 1]) + course.credits > FIRST_YEAR_SUBJECT_CAP) {
          continue;
        }
        let score = 0;
        if (creditsOf(semester) < MIN_CREDITS) score += 20;
        else if (total < TARGET_CREDITS) score += 5;
        else score -= 5;
        for (const designation of course.designations) if (unmet.has(designation)) score += 6;
        score -= course.number / 1000;
        score += breadthBias(plan.profileId, course.code);
        if (!best || score > best.score) best = { course, index: semester.index, score };
      }
    }
    if (!best || best.score < 0) return;
    plan.semesters[best.index].courses.push({
      code: best.course.code,
      role: "breadth",
      requirements: [],
      note: "Breadth course with no prerequisite sentence in the 2026–2027 listing.",
    });
  }
}

function basePlan(profile: Profile, goal: string): Plan {
  return {
    profileId: profile.id,
    goal,
    startYear: START_YEAR,
    placements: [...profile.placements, "SPAN 1300"],
    completed: [],
    semesters: emptySemesters(START_YEAR),
    notes: [
      `Schedules use Yale College Programs of Study ${"2026–2027"} and start in Fall ${START_YEAR}. Sections in those future terms are not confirmed offerings.`,
      "Most course pages print no positive credit. Yale says most courses carry one credit and that variations are printed. Explicit 1/2 and 1 1/2 credits are kept; otherwise Trajectory uses 1.0 and labels the inference.",
      ...profile.assumptions,
    ],
  };
}

export function buildProfilePlan(profile: Profile, goal = profile.summary): { plan: Plan; report: Report } {
  const plan = basePlan(profile, goal);
  for (const slot of profile.slots) {
    const failure = placeSlot(plan, slot);
    if (failure) plan.notes.push(failure);
  }
  refill(plan);
  return { plan, report: validate(plan, profile) };
}

export function validate(plan: Plan, profile: Profile): Report {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const scheduled = plan.semesters.flatMap((semester) => semester.courses);

  for (const note of plan.notes) {
    if (note.includes("could not be scheduled") || note.includes("not in the parsed")) {
      errors.push({ severity: "error", message: note });
    }
  }

  for (const semester of plan.semesters) {
    const credits = creditsOf(semester);
    if (credits + 1e-9 < MIN_CREDITS) {
      errors.push({ severity: "error", message: `${semester.label} has ${credits} credits. A normal term is 4 or 5.` });
    }
    if (credits > 5 + 1e-9) {
      warnings.push({
        severity: "warning",
        message: `${semester.label} is ${credits} credits. Six credits need a dean's permission; this term stays under that line.`,
      });
    }
    const heavy = semester.courses.filter((item) => {
      const course = getCourse(item.code);
      return course ? isHeavy(course) : false;
    });
    if (heavy.length >= 3) {
      warnings.push({
        severity: "warning",
        message: `${semester.label} stacks ${heavy.length} demanding courses (${heavy.map((item) => displayCode(item.code)).join(", ")}).`,
      });
    }
  }

  if (plan.semesters.length >= 2) {
    const subjects = new Set(
      plan.semesters.slice(0, 2).flatMap((semester) => semester.courses.map((item) => getCourse(item.code)?.subject).filter(Boolean)),
    );
    for (const subject of subjects) {
      const total = subjectCredits(plan, subject as string, [0, 1]);
      if (total > FIRST_YEAR_SUBJECT_CAP + 1e-9) {
        errors.push({
          severity: "error",
          message: `First-year rules cap ${subject} at 4 credits across the first two terms; this plan has ${total}.`,
        });
      }
    }
  }

  const total = plan.semesters.reduce((sum, semester) => sum + creditsOf(semester), 0);
  if (total + 1e-9 < TARGET_CREDITS) {
    errors.push({ severity: "error", message: `The plan has ${total} credits. The bachelor's degree requires 36.` });
  }

  const conflict = exclusiveConflict(scheduled.map((item) => item.code));
  if (conflict) errors.push({ severity: "error", message: `${conflict.join(" and ")} are alternate versions of the same requirement.` });

  for (const semester of plan.semesters) {
    const { earlier, same } = earlierAndCurrent(plan, semester.index);
    for (const item of semester.courses) {
      const course = getCourse(item.code);
      if (!course) {
        errors.push({ severity: "error", message: `${item.code} is not in the catalog.`, code: item.code });
        continue;
      }
      if (course.terms.length > 0 && !course.terms.includes(semester.term)) {
        errors.push({
          severity: "error",
          message: `${displayCode(course.code)} is not listed for ${semester.term}.`,
          code: course.code,
        });
      }
      const expr = prereqFor(course.code);
      const withoutSelf = new Set([...same].filter((code) => code !== canonical(course.code)));
      if (expr && !exprSatisfied(expr, earlier, withoutSelf)) {
        errors.push({
          severity: "error",
          message: `${displayCode(course.code)} is placed before its catalog prerequisite is satisfied.`,
          code: course.code,
        });
      }
      if (item.senior && semester.index < 6) {
        errors.push({ severity: "error", message: `${displayCode(course.code)} has to be taken in the senior year.`, code: course.code });
      }
      if (course.bracketedNotOfferedThisCatalogYear) {
        warnings.push({
          severity: "warning",
          message: `${displayCode(course.code)} is bracketed: not offered in 2026–2027, and only expected the following year.`,
          code: course.code,
        });
      }
    }
  }

  const starred = scheduled.filter((item) => getCourse(item.code)?.limitedEnrollmentMarker);
  if (starred.length > 0) {
    warnings.push({
      severity: "warning",
      message: `${starred.length} courses are starred in the catalog. The YCPS key uses a star for limited enrollment; confirm each section in Yale Course Search.`,
    });
  }

  const requirements = profile.requirements.map((requirement): RequirementResult => {
    const courses = scheduled.filter((item) => item.requirements.includes(requirement.id)).map((item) => canonical(item.code));
    const met = courses.length >= requirement.minCourses;
    return {
      id: requirement.id,
      label: requirement.label,
      detail: requirement.detail,
      sourceUrl: requirement.sourceUrl,
      hard: requirement.hard,
      courses,
      status: met ? "met" : requirement.hard ? "unmet" : "needs-confirmation",
    };
  });

  const designations = assignDesignations(plan);
  const distributionLabels: Record<string, string> = {
    HU: "Humanities and arts",
    SO: "Social sciences",
    SC: "Sciences",
    QR: "Quantitative reasoning",
    WR: "Writing",
    L4: "Language (L4 placement)",
  };
  for (const [key, count] of Object.entries({ ...AREA_NEED, L4: 1 })) {
    const courses = designations[key] ?? [];
    const met = courses.length >= count;
    requirements.push({
      id: `distribution-${key}`,
      label: distributionLabels[key] ?? key,
      detail: `At least ${count} course credit${count === 1 ? "" : "s"}. A course counts toward only one distributional requirement.`,
      sourceUrl: "https://catalog.yale.edu/ycps/academic-regulations/requirements-for-ba-bs-degree/",
      hard: true,
      courses,
      status: met ? "met" : "unmet",
    });
    if (!met) {
      errors.push({ severity: "error", message: `${distributionLabels[key] ?? key} still needs ${count - courses.length} credit(s).` });
    }
  }

  for (const requirement of requirements) {
    if (requirement.hard && requirement.status === "unmet" && !requirement.id.startsWith("distribution-")) {
      errors.push({ severity: "error", message: `${requirement.label} is not met.` });
    }
  }

  warnings.push({
    severity: "warning",
    message:
      "Future-term sections are tentative. Confirm every code, credit, prerequisite, and meeting time in Yale Course Search before enrolling.",
  });

  return { errors, warnings, requirements, credits: round(total), designationUse: designations };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function relocate(plan: Plan, profile: Profile, code: string): { plan: Plan; report: Report; message: string } {
  const next = structuredClone(plan);
  let found: PlannedCourse | undefined;
  for (const semester of next.semesters) {
    const index = semester.courses.findIndex((item) => sameCourse(item.code, code));
    if (index >= 0) {
      found = semester.courses.splice(index, 1)[0];
      break;
    }
  }
  if (!found) return { plan, report: validate(plan, profile), message: "That course is not on the plan." };
  const slot: Slot = { ...found };
  const failure = placeSlot(next, slot);
  refill(next);
  const report = validate(next, profile);
  return {
    plan: next,
    report,
    message: failure
      ? failure
      : `${displayCode(found.code)} was moved to the earliest term that satisfies its prerequisite and the term pattern.`,
  };
}

export function moveCourse(
  plan: Plan,
  profile: Profile,
  code: string,
  semesterIndex: number,
): { plan: Plan; report: Report; message: string } {
  const next = structuredClone(plan);
  let found: PlannedCourse | undefined;
  for (const semester of next.semesters) {
    const index = semester.courses.findIndex((item) => sameCourse(item.code, code));
    if (index >= 0) {
      found = semester.courses.splice(index, 1)[0];
      break;
    }
  }
  if (!found) return { plan, report: validate(plan, profile), message: "That course is not on the plan." };
  const blocked = canPlace(next, found, semesterIndex);
  if (!blocked) {
    next.semesters[semesterIndex].courses.push(found);
    refill(next);
    return {
      plan: next,
      report: validate(next, profile),
      message: `${displayCode(found.code)} is now in ${next.semesters[semesterIndex].label}.`,
    };
  }
  const failure = placeSlot(next, found);
  refill(next);
  const landed = next.semesters.find((semester) => semester.courses.some((item) => sameCourse(item.code, code)));
  return {
    plan: next,
    report: validate(next, profile),
    message: failure
      ? failure
      : `${displayCode(code)} cannot go in that term (${blocked}). It was recalculated into ${landed?.label ?? "another term"}.`,
  };
}

export function swapCourse(
  plan: Plan,
  profile: Profile,
  code: string,
  replacement: string,
): { plan: Plan; report: Report; message: string } {
  const next = structuredClone(plan);
  const course = getCourse(replacement);
  if (!course) {
    return { plan, report: validate(plan, profile), message: `${replacement} is not in the 2026–2027 catalog.` };
  }
  let host: PlannedCourse | undefined;
  for (const semester of next.semesters) {
    const index = semester.courses.findIndex((item) => sameCourse(item.code, code));
    if (index >= 0) {
      host = semester.courses.splice(index, 1)[0];
      break;
    }
  }
  if (!host) return { plan, report: validate(plan, profile), message: "That course is not on the plan." };
  host.code = canonical(replacement);
  host.note = `Swapped in for ${displayCode(code)}. Confirm it still meets the same requirement.`;
  const failure = placeSlot(next, host);
  refill(next);
  return {
    plan: next,
    report: validate(next, profile),
    message: failure ? failure : `${displayCode(code)} was replaced with ${displayCode(replacement)}.`,
  };
}

export function setCompleted(plan: Plan, code: string, completed: boolean): Plan {
  const next = structuredClone(plan);
  const canon = canonical(code);
  next.completed = next.completed.filter((item) => !sameCourse(item, canon));
  if (completed) next.completed.push(canon);
  return next;
}

export function progress(plan: Plan, report: Report): { done: number; total: number } {
  const hard = report.requirements.filter((item) => item.hard);
  const done = hard.filter((item) => item.status === "met" || item.courses.some((code) => plan.completed.some((doneCode) => sameCourse(doneCode, code)))).length;
  return { done, total: hard.length };
}

export function courseRole(role: Role): string {
  switch (role) {
    case "major":
      return "Major";
    case "preparation":
      return "Preparation";
    case "distribution":
      return "Distribution";
    case "career":
      return "Career";
    case "prehealth":
      return "Health professions";
    default:
      return "Breadth";
  }
}
