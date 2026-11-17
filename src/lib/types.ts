export type Term = "fall" | "spring";

export type Role =
  | "major"
  | "preparation"
  | "distribution"
  | "career"
  | "prehealth"
  | "breadth";

export interface Slot {
  code: string;
  role: Role;
  requirements: string[];
  senior?: boolean;
  note?: string;
}

export interface RequirementDef {
  id: string;
  label: string;
  detail: string;
  sourceUrl: string;
  minCourses: number;
  hard: boolean;
}

export interface Org {
  name: string;
  category: string;
  why: string;
  sourceUrl: string;
}

export interface Milestone {
  when: string;
  text: string;
}

export interface StudyItem {
  title: string;
  kind: string;
  why: string;
  url: string;
  timeline: string;
}

export interface Profile {
  id: string;
  career: "consulting" | "quant" | "premed" | "math" | "ai" | "global" | "applied";
  title: string;
  majorName: string;
  degree: string;
  summary: string;
  why: string[];
  assumptions: string[];
  placements: string[];
  slots: Slot[];
  requirements: RequirementDef[];
  alternativeIds: string[];
  orgs: Org[];
  milestones: Milestone[];
  selfStudy: StudyItem[];
  signature: string;
}

export interface PlannedCourse {
  code: string;
  role: Role;
  requirements: string[];
  senior?: boolean;
  note?: string;
}

export interface Semester {
  index: number;
  term: Term;
  label: string;
  courses: PlannedCourse[];
}

export interface Plan {
  profileId: string;
  goal: string;
  startYear: number;
  placements: string[];
  completed: string[];
  semesters: Semester[];
  notes: string[];
}

export interface Issue {
  severity: "error" | "warning";
  message: string;
  code?: string;
}

export interface RequirementResult {
  id: string;
  label: string;
  detail: string;
  sourceUrl: string;
  status: "met" | "unmet" | "needs-confirmation";
  hard: boolean;
  courses: string[];
}

export interface Report {
  errors: Issue[];
  warnings: Issue[];
  requirements: RequirementResult[];
  credits: number;
  designationUse: Record<string, string[]>;
}
