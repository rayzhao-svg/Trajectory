import type { Org, Profile, RequirementDef, Slot, StudyItem } from "./types";

const ORGS = "https://studentorgs.yale.edu/media/105/download?inline=";
const DEGREE = "https://catalog.yale.edu/ycps/academic-regulations/requirements-for-ba-bs-degree/";
const LOADS = "https://catalog.yale.edu/ycps/academic-regulations/course-credits-course-loads/";
const ECON = "https://catalog.yale.edu/ycps/subjects-of-instruction/economics/";
const CPSC = "https://catalog.yale.edu/ycps/subjects-of-instruction/computer-science/";
const MATH = "https://catalog.yale.edu/ycps/subjects-of-instruction/mathematics/";
const SDS = "https://catalog.yale.edu/ycps/subjects-of-instruction/statistics/";
const MCDB = "https://catalog.yale.edu/ycps/subjects-of-instruction/molecular-cellular-developmental-biology/";
const MBB = "https://catalog.yale.edu/ycps/subjects-of-instruction/molecular-biophysics-biochemistry/";
const AMTH = "https://catalog.yale.edu/ycps/subjects-of-instruction/applied-mathematics/";
const GLBL = "https://catalog.yale.edu/ycps/subjects-of-instruction/global-affairs/";
const MD = "https://medicine.yale.edu/md-program/admissions/requirements/";
const OCS = "https://ocs.yale.edu/";

function slot(code: string, role: Slot["role"], requirements: string[] = [], extra: Partial<Slot> = {}): Slot {
  return { code, role, requirements, ...extra };
}

function req(partial: RequirementDef): RequirementDef {
  return partial;
}

const distribution: Slot[] = [
  slot("ENGL 1014", "distribution"),
  slot("ENGL 1020", "distribution"),
  slot("HSAR 1110", "distribution"),
  slot("HSAR 3220", "distribution"),
  slot("SPAN 1400", "distribution", [], { note: "Assumes placement into L4. SPAN 1400 is the fourth-term course and carries 1.5 credits." }),
];

const sciencePair: Slot[] = [
  slot("NSCI 1600", "distribution"),
  slot("MB&B 1050", "distribution"),
];

const socialPair: Slot[] = [slot("PLSC 1113", "distribution"), slot("PLSC 1222", "distribution")];

const bazaar = (name: string, category: string, why: string): Org => ({
  name,
  category,
  why,
  sourceUrl: ORGS,
});

const consultingStudy: StudyItem[] = [
  {
    title: "Case in Point",
    kind: "Book",
    why: "Marc Cosentino's case-interview book is the standard companion to on-campus consulting recruiting. Yale economics does not teach case interviews.",
    url: "https://www.caseinterview.com/",
    timeline: "Start the summer before junior year and practice weekly through recruiting.",
  },
  {
    title: "Victor Cheng, Case Interview Secrets",
    kind: "Course",
    why: "Frameworks and fit-interview practice are not part of the Economics major.",
    url: "https://www.caseinterview.com/",
    timeline: "Pair with live practice; do not treat a book as a substitute for mock interviews.",
  },
];

const sharedAssumptions = [
  "Language placement is L4, so one L4 course satisfies the language requirement. SPAN 1400 continues SPAN 130; the plan treats L4 placement as satisfying that continuation. Confirm placement with the department.",
  "MATH 1120, when it appears, requires the Mathematics online placement exam.",
  "A starred catalog entry is preserved. The YCPS key uses a star for limited enrollment; some 2026–2027 lecture titles are also starred, so the star is not treated as a cancellation.",
];

const econConsulting: Profile = {
  id: "econ-consulting",
  career: "consulting",
  title: "Economics for management consulting",
  majorName: "Economics",
  degree: "B.A.",
  summary: "A 12-course Economics major aimed at management consulting, with game theory, financial economics, and a second econometrics course.",
  why: [
    "The Economics department says the major builds critical reasoning and data analysis and that recent majors have gone into business, government, and nonprofits.",
    "Consulting recruiters routinely look for microeconomics, comfort with numbers, and structured communication. Intermediate theory plus econometrics is the part Yale actually teaches; case interviews are not a Yale course.",
    "MATH 1180 is one of the math courses the department prefers for students who want economics applications.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "No economics or calculus placement is assumed. Introductory microeconomics is taken, not skipped.",
    "ECON 4424 and ECON 4409 are two different 4400–4491 courses, both in the senior year. Seminars are limited and change year to year.",
  ],
  placements: [],
  signature: "ECON 2121",
  alternativeIds: ["global-affairs"],
  slots: [
    slot("MATH 1120", "preparation"),
    slot("ECON 1115", "major", ["econ-micro"]),
    ...distribution,
    slot("MATH 1180", "major", ["econ-math"]),
    slot("ECON 1116", "major", ["econ-macro"]),
    slot("ECON 1117", "major", ["econ-metrics"]),
    slot("ECON 2121", "major", ["econ-inter-micro"]),
    slot("ECON 2259", "major", ["econ-elective"], { note: "Game theory. The catalog lists this as ECON 2259 / GLBL 2159. The EP&E checklist still names ECON 2159; this plan uses the course that is actually titled Game Theory." }),
    slot("ECON 2251", "major", ["econ-elective"]),
    slot("ECON 2122", "major", ["econ-inter-macro"]),
    slot("ECON 2123", "major", ["econ-elective"]),
    slot("ECON 3303", "major", ["econ-elective"]),
    ...sciencePair,
    slot("ECON 4424", "major", ["econ-senior"], { senior: true }),
    slot("ECON 4409", "major", ["econ-senior"], { senior: true }),
  ],
  requirements: [
    req({ id: "econ-micro", label: "Introductory microeconomics", detail: "ECON 1108, 1110, or 1115.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-macro", label: "Introductory macroeconomics", detail: "ECON 1111 or 1116.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-inter-micro", label: "Intermediate microeconomics", detail: "ECON 2121 or 2125.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-inter-macro", label: "Intermediate macroeconomics", detail: "ECON 2122 or 2126.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-metrics", label: "Econometrics", detail: "ECON 1117, 2123, or 2136.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-math", label: "Mathematics", detail: "MATH 1180 or 1200 is preferred. MATH 1120 is allowed but is used here only as preparation for 1180.", sourceUrl: ECON, minCourses: 1, hard: true }),
    req({ id: "econ-elective", label: "Economics electives", detail: "Four ECON courses numbered 2000 or above that are not already used for the core.", sourceUrl: ECON, minCourses: 4, hard: true }),
    req({ id: "econ-senior", label: "Senior requirement", detail: "Two courses numbered ECON 4400–4491, at least one in the senior year.", sourceUrl: ECON, minCourses: 2, hard: true }),
  ],
  orgs: [
    bazaar("Yale Undergraduate Consulting Group (YUCG)", "Pre-professional", "Listed in the 2026 Extracurricular Bazaar under pre-professional organizations. Use it to practice cases with other students."),
    bazaar("Global Strategy Consulting Group", "Business and entrepreneurship", "Listed in the 2026 bazaar's business and entrepreneurship section."),
    bazaar("Elmseed Consulting Group at Yale University", "Pre-professional", "A second consulting group on the 2026 bazaar list, useful if you want client work outside the largest group."),
    bazaar("Yale Debate Association", "Politics and society", "Listed in the 2026 bazaar. Debate is practice in structuring an argument under time pressure."),
    bazaar("Yale Policy Institute", "Politics and society", "Listed in the 2026 bazaar. Relevant if you want consulting work that faces the public sector."),
  ],
  milestones: [
    { when: "First year", text: "Take introductory microeconomics and calculus. Visit the Office of Career Strategy and read how Yale's recruiting calendar actually works." },
    { when: "Sophomore year", text: "Finish intermediate microeconomics and introductory econometrics. Apply to a student consulting group." },
    { when: "Summer after sophomore year", text: "Typical recruiting for junior-summer consulting internships begins around this time. Confirm dates with OCS and with each firm." },
    { when: "Junior fall", text: "Many firms interview Yale juniors in the fall. Have a resume, transcript, and case practice ready before shopping period ends." },
    { when: "Senior year", text: "Complete two ECON 4400–4491 courses. Full-time recruiting, if still open, is again an OCS conversation, not a date Trajectory can freeze." },
  ],
  selfStudy: consultingStudy,
};

const quant: Profile = {
  id: "quant-sds",
  career: "quant",
  title: "Statistics and Data Science for quantitative finance",
  majorName: "Statistics and Data Science",
  degree: "B.S.",
  summary: "The B.S. in Statistics and Data Science, with probability, linear algebra, machine learning, and computer science electives used by quantitative finance roles.",
  why: [
    "The B.S. requires S&DS 2420 and S&DS 3650 and is the catalog's more research-oriented statistics degree.",
    "Quantitative finance interviews lean on probability, statistics, and programming. Those are major requirements here, not a minor add-on.",
    "S&DS 2410 and 2420 are cross-listed as MATH 2410 and 2420. The plan uses the mathematics numbers because that is how the parsed catalog stores the single course.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "S&DS 3650 asks for computing at the level of S&DS 2650 or CPSC 2000. This plan uses CPSC 2010, which the catalog describes as the introductory course above CPSC 1001. Confirm that substitution with the instructor.",
    "Five B.S. electives are drawn from computational skills, methods, mathematical foundations, and efficient computation. They are not claimed as 'data science in context' electives, which the B.S. excludes.",
  ],
  placements: [],
  signature: "MATH 2420",
  alternativeIds: ["applied-math"],
  slots: [
    slot("MATH 1120", "preparation"),
    slot("CPSC 1001", "major", ["sds-comp"]),
    slot("MATH 1150", "preparation"),
    slot("CPSC 2010", "major", ["sds-comp"]),
    slot("MATH 1200", "preparation", ["sds-calc"]),
    slot("CPSC 2020", "preparation"),
    slot("CPSC 2230", "major", ["sds-elective"]),
    slot("MATH 2410", "major", ["sds-prob"], { note: "Cross-listed as S&DS 2410." }),
    slot("MATH 2250", "major", ["sds-linalg"]),
    slot("MATH 2420", "major", ["sds-prob"], { note: "Cross-listed as S&DS 2420. The B.S. requires this course." }),
    slot("S&DS 2380", "major", ["sds-elective"]),
    slot("MATH 2550", "major", ["sds-math-extra"]),
    slot("S&DS 3650", "major", ["sds-methods", "sds-ml"]),
    slot("S&DS 3120", "major", ["sds-methods"]),
    slot("CPSC 3230", "major", ["sds-elective"]),
    slot("CPSC 3650", "major", ["sds-elective"]),
    slot("MATH 3020", "major", ["sds-elective"]),
    slot("S&DS 4910", "major", ["sds-senior"], { senior: true }),
    ...distribution,
    ...sciencePair,
    ...socialPair,
  ],
  requirements: [
    req({ id: "sds-calc", label: "Multivariable calculus prerequisite", detail: "MATH 1200, ENAS 1510, or MATH 3020. This plan takes MATH 1200 before the 14-course major.", sourceUrl: SDS, minCourses: 1, hard: true }),
    req({ id: "sds-linalg", label: "Linear algebra", detail: "MATH 2220, 2250, or 2260.", sourceUrl: SDS, minCourses: 1, hard: true }),
    req({ id: "sds-prob", label: "Core probability and statistics", detail: "Two courses, including S&DS 2420. S&DS 2410 / MATH 2410 is the prerequisite sequence.", sourceUrl: SDS, minCourses: 2, hard: true }),
    req({ id: "sds-comp", label: "Computational skills", detail: "Two courses. CPSC 1001 and CPSC 2010 are both named in the catalog's examples.", sourceUrl: SDS, minCourses: 2, hard: true }),
    req({ id: "sds-methods", label: "Methods of data science", detail: "Two courses, including S&DS 3650.", sourceUrl: SDS, minCourses: 2, hard: true }),
    req({ id: "sds-ml", label: "S&DS 3650", detail: "The B.S. specifically requires S&DS 3650.", sourceUrl: SDS, minCourses: 1, hard: true }),
    req({ id: "sds-math-extra", label: "Additional mathematical foundations", detail: "One further course from the mathematical foundations examples. This plan uses MATH 2550.", sourceUrl: SDS, minCourses: 1, hard: true }),
    req({ id: "sds-elective", label: "B.S. electives", detail: "Five courses from allowed discipline areas, excluding data-science-in-context and methods-in-application-areas.", sourceUrl: SDS, minCourses: 5, hard: true }),
    req({ id: "sds-senior", label: "Senior project", detail: "S&DS 4910 or 4920. This plan uses the fall listing, S&DS 4910.", sourceUrl: SDS, minCourses: 1, hard: true }),
  ],
  orgs: [
    bazaar("Yale Student Quantitative Finance Organization", "Business and entrepreneurship", "Named in the 2026 bazaar. Closest student group to this career goal."),
    bazaar("Yale Student Investment Group", "Pre-professional", "Listed in the 2026 bazaar's pre-professional section."),
    bazaar("Yale Capital Partners", "Business and entrepreneurship", "Listed in the 2026 bazaar."),
    bazaar("Yale Undergraduate Actuarial Science Association", "Pre-professional", "Listed in the 2026 bazaar. Useful if the interest is pricing and risk rather than only trading."),
  ],
  milestones: [
    { when: "First year", text: "Finish single-variable calculus and start programming. Quant roles will ask about both." },
    { when: "Sophomore year", text: "Take MATH 2410 / S&DS 2410 in the fall and the statistics course in the spring, alongside linear algebra." },
    { when: "Summer after sophomore year", text: "Markets and research programs hire on their own calendars. Use OCS rather than a generic finance timeline." },
    { when: "Junior year", text: "Take S&DS 3650 and S&DS 3120 only after probability, statistics, and linear algebra." },
    { when: "Senior year", text: "S&DS 4910 is the senior project. A faculty adviser has to agree; the catalog requires that." },
  ],
  selfStudy: [
    {
      title: "A Practical Guide to Quantitative Finance Interviews",
      kind: "Book",
      why: "Xinfeng Zhou's interview book covers probability puzzles that the S&DS major does not drill in interview format.",
      url: "https://www.amazon.com/Practical-Guide-Quantitative-Finance-Interviews/dp/1438236662",
      timeline: "After S&DS 2410, not before.",
    },
    {
      title: "Options, Futures, and Other Derivatives",
      kind: "Book",
      why: "John Hull's derivatives text is the usual reference for options pricing. Yale College does not require it for this major.",
      url: "https://www.pearson.com/en-us/subject-catalog/p/options-futures-and-other-derivatives/P200000003389",
      timeline: "Junior year, after probability and a first finance or economics elective if you add one.",
    },
  ],
};

const premed: Profile = {
  id: "premed-mcdb",
  career: "premed",
  title: "MCDB B.S. and Yale School of Medicine prerequisites",
  majorName: "Molecular, Cellular, and Developmental Biology",
  degree: "B.S.",
  summary: "An MCDB B.S. that also covers the Yale M.D. prerequisite list: biology, general chemistry and labs, organic chemistry and lab, biochemistry, physics, and statistics.",
  why: [
    "The MCDB catalog says the B.S. prerequisites fulfill most of the usual premedical science requirements, and that a physics laboratory is not required for the B.S. but might be for medical school.",
    "Yale School of Medicine currently asks for two semesters of biology with lab, two of general chemistry with lab, one organic chemistry course with lab, biochemistry, two physics courses with lab, and recommends statistics.",
    "BIOL 1010–1040 are half-term modules, not lab courses. MCDB labs are scheduled as well, and a medical school may still want a biology lab that matches its own wording.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "No chemistry, biology, or physics placement is assumed.",
    "Statistics is recommended for Yale M.D. applicants in the current cycle and required beginning with the 2027–28 application year.",
    "The MCDB distribution attribute and DUS-approved substitutions are not invented. This plan uses only courses named in the B.S. summary.",
  ],
  placements: [],
  signature: "CHEM 2200",
  alternativeIds: ["mbb-ba"],
  slots: [
    slot("CHEM 1610", "prehealth", ["premed-genchem", "mcdb-chem"]),
    slot("CHEM 1340L", "prehealth", ["premed-genchem"]),
    slot("BIOL 1010", "prehealth", ["premed-bio", "mcdb-biol"]),
    slot("BIOL 1020", "prehealth", ["premed-bio", "mcdb-biol"]),
    slot("MATH 1120", "preparation"),
    slot("CHEM 1650", "prehealth", ["premed-genchem", "mcdb-chem"]),
    slot("CHEM 1360L", "prehealth", ["premed-genchem"]),
    slot("BIOL 1030", "prehealth", ["premed-bio", "mcdb-biol"]),
    slot("BIOL 1040", "prehealth", ["premed-bio", "mcdb-biol"]),
    slot("MATH 1150", "preparation", ["mcdb-math"]),
    slot("CHEM 2200", "prehealth", ["premed-orgo", "mcdb-orgo"]),
    slot("CHEM 2220L", "prehealth", ["premed-orgo", "mcdb-orgo"]),
    slot("SPAN 1400", "distribution"),
    slot("ENGL 1014", "distribution"),
    slot("MCDB 2000", "major", ["mcdb-core"]),
    slot("MCDB 2010L", "major", ["mcdb-lab"]),
    slot("ENGL 1020", "distribution"),
    slot("HSAR 3220", "distribution"),
    slot("PSYC 1100", "prehealth", ["premed-psych"]),
    slot("PHYS 1700", "prehealth", ["premed-physics", "mcdb-phys"]),
    slot("PHYS 1650L", "prehealth", ["premed-physics-lab"]),
    slot("MCDB 2020", "major", ["mcdb-core"]),
    slot("MB&B 3000", "major", ["premed-biochem", "mcdb-core"]),
    slot("MCDB 3500", "major", ["mcdb-advanced"]),
    slot("PHYS 1710", "prehealth", ["premed-physics", "mcdb-phys"]),
    slot("PHYS 1660L", "prehealth", ["premed-physics-lab"]),
    slot("MCDB 2050", "major", ["mcdb-extra-core"]),
    slot("MCDB 2100", "major", ["mcdb-extra-core"]),
    slot("MCDB 2510L", "major", ["mcdb-lab"]),
    slot("S&DS 1000", "prehealth", ["premed-stats"]),
    slot("HSAR 1110", "distribution"),
    slot("PLSC 1222", "distribution"),
    slot("MCDB 4850", "major", ["mcdb-senior"], { senior: true }),
    slot("MCDB 4860", "major", ["mcdb-senior"], { senior: true }),
  ],
  requirements: [
    req({ id: "premed-bio", label: "Introductory biology modules", detail: "BIOL 1010, 1020, 1030, and 1040. Each is a half-term module of 0.5 credit in this catalog, not a laboratory.", sourceUrl: MD, minCourses: 4, hard: true }),
    req({ id: "premed-genchem", label: "General chemistry with labs", detail: "CHEM 1610, 1650, 1340L, and 1360L.", sourceUrl: MD, minCourses: 4, hard: true }),
    req({ id: "premed-orgo", label: "Organic chemistry with lab", detail: "CHEM 2200 and CHEM 2220L. Yale M.D. admissions ask for one organic course plus lab.", sourceUrl: MD, minCourses: 2, hard: true }),
    req({ id: "premed-biochem", label: "Biochemistry", detail: "MB&B 3000. The M.D. page asks for one semester; the lab is recommended, not required.", sourceUrl: MD, minCourses: 1, hard: true }),
    req({ id: "premed-physics", label: "Physics lectures", detail: "PHYS 1700 and 1710, the life-sciences sequence.", sourceUrl: MD, minCourses: 2, hard: true }),
    req({ id: "premed-physics-lab", label: "Physics laboratories", detail: "PHYS 1650L and 1660L. MCDB does not require them; Yale M.D. admissions ask for two lab semesters.", sourceUrl: MD, minCourses: 2, hard: true }),
    req({ id: "premed-stats", label: "Statistics", detail: "S&DS 1000. Recommended now, required for Yale M.D. applicants starting in the 2027–28 application year.", sourceUrl: MD, minCourses: 1, hard: true }),
    req({ id: "premed-psych", label: "Introductory psychology", detail: "PSYC 1100. The MCAT expects introductory psychology; it is not an MCDB requirement.", sourceUrl: "https://advising.yalecollege.yale.edu/preparing-health-care-professions", minCourses: 1, hard: true }),
    req({ id: "mcdb-biol", label: "MCDB biology prerequisite", detail: "BIOL 1010–1040, or placement. This plan takes all four modules.", sourceUrl: MCDB, minCourses: 4, hard: true }),
    req({ id: "mcdb-chem", label: "MCDB general chemistry", detail: "A two-term chemistry lecture sequence. B.S. students also take the associated labs.", sourceUrl: MCDB, minCourses: 2, hard: true }),
    req({ id: "mcdb-orgo", label: "MCDB organic chemistry", detail: "One term of organic chemistry with lab: CHEM 2200 and 2220L.", sourceUrl: MCDB, minCourses: 2, hard: true }),
    req({ id: "mcdb-phys", label: "MCDB physics", detail: "Two terms of PHYS 1700 or higher for the B.S.", sourceUrl: MCDB, minCourses: 2, hard: true }),
    req({ id: "mcdb-math", label: "MCDB mathematics", detail: "MATH 1150 or higher, or an approved statistics course. MATH 1120 is preparation; MATH 1150 completes the calculus prerequisite.", sourceUrl: MCDB, minCourses: 1, hard: true }),
    req({ id: "mcdb-core", label: "MCDB core", detail: "Three courses from MCDB 2000, 2020, 2050, 2100, 2900, 3000, or MB&B 3000.", sourceUrl: MCDB, minCourses: 3, hard: true }),
    req({ id: "mcdb-extra-core", label: "Courses in place of general electives", detail: "The B.S. allows two additional core courses instead of two MCDB 2500+ electives. This plan uses MCDB 2050 and 2100.", sourceUrl: MCDB, minCourses: 2, hard: true }),
    req({ id: "mcdb-advanced", label: "Advanced MCDB elective", detail: "One course numbered MCDB 3500 or above. MCDB 3500 is starred, so enrollment is limited.", sourceUrl: MCDB, minCourses: 1, hard: true }),
    req({ id: "mcdb-lab", label: "MCDB laboratories", detail: "Two labs from the B.S. list. This plan uses MCDB 2010L and MCDB 2510L.", sourceUrl: MCDB, minCourses: 2, hard: true }),
    req({ id: "mcdb-senior", label: "MCDB senior research", detail: "MCDB 4850 and 4860 in the senior year. The catalog lists them as a research pair.", sourceUrl: MCDB, minCourses: 2, hard: true }),
  ],
  orgs: [
    bazaar("Yale Medical Professions Outreach (YMPO)", "Pre-professional", "Listed in the 2026 bazaar's pre-professional section."),
    bazaar("Yale Global Health Review", "Academics", "Listed in the 2026 bazaar's academics section."),
    bazaar("Women in Chemistry+", "Academics", "Listed in the 2026 bazaar. Relevant if you want a chemistry community alongside MCDB."),
  ],
  milestones: [
    { when: "First year", text: "General chemistry, both labs, the four biology modules, and calculus. Do not add a third lab science on top of this." },
    { when: "Sophomore year", text: "Organic chemistry and MCDB 2000. The catalog aims MCDB 2010L at first-years and sophomores, so it is placed here." },
    { when: "Junior year", text: "Physics, biochemistry, and the remaining MCDB cores. Talk to health-professions advisers before you set an MCAT date." },
    { when: "Summer before senior year", text: "Yale M.D. applications and the MCAT are individual timelines. OCS health professions advising is the office that should set them, not this planner." },
    { when: "Senior year", text: "MCDB 4850 and 4860. The B.S. expects at least ten hours a week in the lab." },
  ],
  selfStudy: [
    {
      title: "AAMC MCAT official prep",
      kind: "Official exam materials",
      why: "Psychology, sociology, and the MCAT's reasoning sections are not covered by the MCDB major. Use the AAMC's own outline.",
      url: "https://students-residents.aamc.org/prepare-mcat-exam",
      timeline: "After biochemistry and physics, on a date chosen with a health-professions adviser.",
    },
  ],
};

const mathBa: Profile = {
  id: "math-ba",
  career: "math",
  title: "Mathematics B.A. toward a Ph.D.",
  majorName: "Mathematics",
  degree: "B.A.",
  summary: "Ten mathematics courses numbered 2250 or higher, including analysis, algebra, and the senior essay, for a student aiming at graduate school in mathematics.",
  why: [
    "The department tells students interested in further pure mathematics to include MATH 3020, 3050, 3100, 3500, and 3700.",
    "The B.A. is ten courses numbered 2250–5999. MATH 1200 is the multivariable prerequisite and is not in that count; MATH 3020 is.",
    "A Ph.D. application also needs letters and reading beyond the ten courses. Those are not things a semester grid can invent.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "Placement into MATH 1200 is assumed, which the catalog says requires MATH 1150 or 1160 or the placement exam. MATH 1150 is not taken for credit.",
    "The three 'YC MATH Distribution' courses are an attribute in Course Search. Trajectory does not claim particular courses carry that attribute.",
    "MATH 4750, the senior essay, needs the DUS's permission. MATH 4800–4890 is the seminar alternative and is starred as not a guaranteed section.",
  ],
  placements: ["MATH 1150"],
  signature: "MATH 3500",
  alternativeIds: ["applied-math"],
  slots: [
    slot("MATH 1200", "preparation", ["math-calc"]),
    slot("MATH 2250", "major", ["math-linalg", "math-ten"]),
    slot("MATH 2550", "major", ["math-analysis", "math-ten"]),
    slot("MATH 2440", "major", ["math-ten"]),
    slot("MATH 3500", "major", ["math-algebra", "math-ten"]),
    slot("MATH 3050", "major", ["math-depth", "math-ten"]),
    slot("MATH 3020", "major", ["math-vector", "math-ten"]),
    slot("MATH 3100", "major", ["math-ten"]),
    slot("MATH 2460", "major", ["math-ten"]),
    slot("MATH 3700", "major", ["math-ten"]),
    slot("MATH 4750", "major", ["math-senior", "math-ten"], { senior: true, note: "Senior essay. Requires DUS permission." }),
    ...distribution,
    ...sciencePair,
    ...socialPair,
  ],
  requirements: [
    req({ id: "math-calc", label: "Calculus through multivariable", detail: "The major prerequisite is single-variable calculus through MATH 1150. This plan then takes MATH 1200.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-linalg", label: "Proof-based linear algebra", detail: "MATH 2250 or 2260.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-analysis", label: "Real analysis introduction", detail: "MATH 2550 or 2560.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-vector", label: "Vector analysis or multivariable calculus", detail: "MATH 3020 or 1200. MATH 3020 is the one counted inside the ten 2250+ courses.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-depth", label: "Further analysis", detail: "MATH 3050 or 3100. This plan takes MATH 3050, and also 3100 as one of the ten.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-algebra", label: "Algebra", detail: "MATH 3500.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-ten", label: "Ten courses numbered 2250–5999", detail: "Includes the senior requirement and excludes MATH 4700.", sourceUrl: MATH, minCourses: 10, hard: true }),
    req({ id: "math-senior", label: "Senior requirement", detail: "A seminar numbered 4800–4890, or MATH 4750 with DUS permission.", sourceUrl: MATH, minCourses: 1, hard: true }),
    req({ id: "math-attribute", label: "YC MATH Distribution attribute", detail: "Three courses must carry the YC MATH Distribution attribute in Yale Course Search. That attribute is not printed on the course-list pages Trajectory parsed, so this row stays unconfirmed.", sourceUrl: MATH, minCourses: 3, hard: false }),
  ],
  orgs: [
    bazaar("Yale Undergraduate Mathematics Society", "Academics", "Listed in the 2026 bazaar's academics section."),
  ],
  milestones: [
    { when: "First year", text: "MATH 1200 and MATH 2250. Talk to the Math DUS before assuming a graduate-school trajectory." },
    { when: "Sophomore year", text: "MATH 2550 and a first pass at algebra or the discrete-math elective." },
    { when: "Junior year", text: "MATH 3050, 3020, 3100, and 3500. Ask about reading courses only after these are underway." },
    { when: "Summer", text: "REU and reading programs have their own deadlines. The department website is the place to check them." },
    { when: "Senior year", text: "MATH 4750 or a senior seminar, plus applications. Letters should come from instructors who have seen proof-based work." },
  ],
  selfStudy: [
    {
      title: "Linear Algebra Done Right",
      kind: "Book",
      why: "Sheldon Axler's book is a standard companion to a proof-based linear algebra course. The free legal copy is on the author's site.",
      url: "https://linear.axler.net/",
      timeline: "Alongside MATH 2250.",
    },
    {
      title: "Principles of Mathematical Analysis",
      kind: "Book",
      why: "Walter Rudin's book is the usual bridge from a first analysis course toward graduate analysis. It is not a Yale course.",
      url: "https://www.mheducation.com/highered/product/principles-mathematical-analysis-rudin.html",
      timeline: "After MATH 2550, before or during MATH 3050.",
    },
    {
      title: "Putnam competition archive",
      kind: "Problem sets",
      why: "The William Lowell Putnam Competition is run by the MAA. It is optional and is not a major requirement.",
      url: "https://maa.org/putnam/",
      timeline: "December of any year after MATH 2250, if you want the practice.",
    },
  ],
};

const csBs: Profile = {
  id: "cs-bs",
  career: "ai",
  title: "Computer Science B.S. for AI, startups, and policy",
  majorName: "Computer Science",
  degree: "B.S.",
  summary: "The Computer Science B.S. with machine learning, language models, and software engineering electives, plus economics and political science outside the major.",
  why: [
    "The B.S. is twelve courses: the core, six intermediate or advanced electives when CPSC 3230 is used, and CPSC 4900.",
    "CPSC 3810 and CPSC 4770 are the catalog's introductory machine-learning course and its large-language-model course. They are electives, not a separate AI major.",
    "The Certificate in Programming is closed to Computer Science majors. Policy depth is taken as ordinary Yale College courses, not as a fake double major.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "No AP Computer Science placement is assumed, so the plan starts at CPSC 1001. The catalog still describes CPSC 2010 as coming after an introductory programming course.",
    "CPSC 3232 and CPSC 3660 are named in the major text but are not separate listings in the 2026–2027 course list used here. The plan uses CPSC 3230 and CPSC 3650, which the major explicitly allows.",
  ],
  placements: [],
  signature: "CPSC 4770",
  alternativeIds: ["cs-ba"],
  slots: [
    slot("CPSC 1001", "preparation"),
    slot("MATH 1120", "preparation"),
    slot("CPSC 2010", "major", ["cs-core"]),
    slot("MATH 1150", "preparation"),
    slot("CPSC 2020", "major", ["cs-core"]),
    slot("CPSC 2230", "major", ["cs-core"]),
    slot("ECON 1115", "career"),
    slot("CPSC 3230", "major", ["cs-core"]),
    slot("CPSC 3270", "major", ["cs-elective"]),
    slot("MATH 1200", "preparation"),
    slot("ECON 1116", "career"),
    slot("CPSC 3650", "major", ["cs-core"]),
    slot("CPSC 4390", "major", ["cs-elective"]),
    slot("CPSC 4740", "major", ["cs-elective"]),
    slot("CPSC 3810", "major", ["cs-elective"]),
    slot("CPSC 4550", "major", ["cs-elective"], { note: "Cross-listed as ECON 4425." }),
    slot("CPSC 4770", "major", ["cs-elective"]),
    slot("CPSC 4900", "major", ["cs-senior"], { senior: true }),
    slot("PLSC 1113", "career"),
    slot("PLSC 1222", "career"),
    ...distribution,
    ...sciencePair,
  ],
  requirements: [
    req({ id: "cs-core", label: "Computer Science core", detail: "CPSC 2010, 2020, 2230, 3230, and 3650. With CPSC 3230, the core is five courses rather than the 3231/3232 pair.", sourceUrl: CPSC, minCourses: 5, hard: true }),
    req({ id: "cs-elective", label: "Intermediate or advanced electives", detail: "Six courses because CPSC 3230 is used. The B.S. total is twelve including the senior project.", sourceUrl: CPSC, minCourses: 6, hard: true }),
    req({ id: "cs-senior", label: "Senior project", detail: "CPSC 4900. The catalog lists it in the fall and requires a faculty supervisor plus DUS permission.", sourceUrl: CPSC, minCourses: 1, hard: true }),
  ],
  orgs: [
    bazaar("Yale Entrepreneurial Society", "Business and entrepreneurship", "Listed in the 2026 bazaar. The right room if the goal includes starting something, not only taking CPSC 4390."),
    bazaar("Yale Computer Society", "Pre-professional", "Listed in the 2026 bazaar's pre-professional section."),
    bazaar("Yale Effective Altruism", "Politics and society", "Listed in the 2026 bazaar."),
    bazaar("Yale Existential Risks Initiative", "Politics and society", "Listed in the 2026 bazaar. Relevant to AI policy, with the usual caveat that a student group is not a research appointment."),
    bazaar("Yale Policy Institute", "Politics and society", "Listed in the 2026 bazaar."),
  ],
  milestones: [
    { when: "First year", text: "CPSC 1001 and 2010, plus calculus. The department wants 2010 and 2230 done by the end of sophomore year." },
    { when: "Sophomore year", text: "CPSC 2230, 2020, and 3230. Introductory economics if you want the policy half of this plan to be real." },
    { when: "Junior year", text: "Algorithms, then machine learning. CPSC 4770 requires CPSC 3810 or an equivalent the instructor accepts." },
    { when: "Summers", text: "Internships and research are not guaranteed by the major. OCS and individual faculty are the routes." },
    { when: "Senior fall", text: "CPSC 4900. The listing is fall-only in this catalog, so the project is not placed in the spring." },
  ],
  selfStudy: [
    {
      title: "Deep Learning",
      kind: "Book",
      why: "Goodfellow, Bengio, and Courville is a free, standard reference. CPSC 3810 is an introduction, not this book.",
      url: "https://www.deeplearningbook.org/",
      timeline: "After CPSC 3810 and MATH 1200.",
    },
    {
      title: "Practical Deep Learning for Coders",
      kind: "Course",
      why: "fast.ai is a public course aimed at building models. It does not replace CPSC 2020 or 3650.",
      url: "https://course.fast.ai/",
      timeline: "The summer after CPSC 2230.",
    },
  ],
};

const csBa: Profile = {
  ...csBs,
  id: "cs-ba",
  title: "Computer Science B.A. with more policy coursework",
  degree: "B.A.",
  summary: "The ten-course Computer Science B.A., leaving room for more political science and philosophy than the B.S.",
  why: [
    "The B.A. uses the same core and senior project as the B.S., with four intermediate or advanced electives when CPSC 3230 is taken instead of six.",
    "Students who want AI literacy and a heavier public-policy load can stay in the B.A. without pretending to complete the B.S.",
  ],
  signature: "CPSC 3810",
  alternativeIds: ["cs-bs"],
  slots: [
    slot("CPSC 1001", "preparation"),
    slot("MATH 1120", "preparation"),
    slot("CPSC 2010", "major", ["cs-ba-core"]),
    slot("MATH 1150", "preparation"),
    slot("CPSC 2020", "major", ["cs-ba-core"]),
    slot("CPSC 2230", "major", ["cs-ba-core"]),
    slot("ECON 1115", "career"),
    slot("CPSC 3230", "major", ["cs-ba-core"]),
    slot("CPSC 3270", "major", ["cs-ba-elective"]),
    slot("ECON 1116", "career"),
    slot("PLSC 1413", "career"),
    slot("CPSC 3650", "major", ["cs-ba-core"]),
    slot("CPSC 4390", "major", ["cs-ba-elective"]),
    slot("PHIL 1175", "career"),
    slot("CPSC 3810", "major", ["cs-ba-elective"]),
    slot("CPSC 4770", "major", ["cs-ba-elective"]),
    slot("CPSC 4900", "major", ["cs-ba-senior"], { senior: true }),
    slot("PLSC 1113", "career"),
    slot("PLSC 1222", "career"),
    ...distribution,
    ...sciencePair,
  ],
  requirements: [
    req({ id: "cs-ba-core", label: "Computer Science core", detail: "CPSC 2010, 2020, 2230, 3230, and 3650.", sourceUrl: CPSC, minCourses: 5, hard: true }),
    req({ id: "cs-ba-elective", label: "B.A. electives", detail: "Four intermediate or advanced courses when CPSC 3230 is taken. The B.A. total is ten, including CPSC 4900.", sourceUrl: CPSC, minCourses: 4, hard: true }),
    req({ id: "cs-ba-senior", label: "Senior project", detail: "CPSC 4900.", sourceUrl: CPSC, minCourses: 1, hard: true }),
  ],
};

const applied: Profile = {
  id: "applied-math",
  career: "applied",
  title: "Applied Mathematics, analysis and economics",
  majorName: "Applied Mathematics",
  degree: "B.A.",
  summary: "The Applied Mathematics B.A. with the required core, three breadth areas, and an analysis concentration.",
  why: [
    "The major is for students who want mathematical technique tied to a field. An analysis concentration plus an economics breadth course is one of the combinations the catalog's own lists allow.",
    "Prerequisites — multivariable calculus, linear algebra, and programming — sit outside the eleven-course count.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "Placement into MATH 1200 is assumed.",
    "Breadth courses are taken from three different catalog areas: analysis, probability and statistics, and mathematical economics. The concentration is three further analysis courses, two of them numbered 3000 or higher.",
  ],
  placements: ["MATH 1150"],
  signature: "AMTH 4910",
  alternativeIds: ["math-ba"],
  slots: [
    slot("MATH 1200", "preparation", ["amth-prereq-calc"]),
    slot("CPSC 1001", "preparation", ["amth-prereq-prog"]),
    slot("MATH 2250", "preparation", ["amth-prereq-linalg"]),
    slot("CPSC 2020", "major", ["amth-discrete"]),
    slot("MATH 2410", "major", ["amth-prob"]),
    slot("S&DS 1000", "preparation"),
    slot("S&DS 2300", "major", ["amth-data"]),
    slot("MATH 2460", "major", ["amth-diffeq"]),
    slot("ECON 1115", "preparation"),
    slot("ECON 2125", "major", ["amth-breadth"]),
    slot("MATH 2550", "major", ["amth-breadth"]),
    slot("MATH 2420", "major", ["amth-breadth"]),
    slot("MATH 3020", "major", ["amth-concentration"]),
    slot("MATH 3050", "major", ["amth-concentration"]),
    slot("MATH 3100", "major", ["amth-concentration"]),
    slot("AMTH 4910", "major", ["amth-senior"], { senior: true }),
    ...distribution,
    slot("PLSC 1113", "distribution"),
    slot("NSCI 1600", "distribution"),
    slot("MB&B 1050", "distribution"),
  ],
  requirements: [
    req({ id: "amth-prereq-calc", label: "Multivariable calculus", detail: "MATH 1200 or ENAS 1510.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-prereq-linalg", label: "Linear algebra prerequisite", detail: "MATH 2220, 2250, or 2260. Prerequisites are outside the eleven-course count.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-prereq-prog", label: "Programming prerequisite", detail: "CPSC 1001 or ENAS 1300.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-diffeq", label: "Differential equations", detail: "ENAS 1940 or MATH 2460.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-prob", label: "Probability", detail: "S&DS 2410 or 2380. This plan uses S&DS 2410 / MATH 2410.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-data", label: "Data analysis", detail: "S&DS 3610 or 2300. This plan takes S&DS 1000 and then S&DS 2300.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-discrete", label: "Discrete mathematics", detail: "AMTH 2440 or CPSC 2020.", sourceUrl: AMTH, minCourses: 1, hard: true }),
    req({ id: "amth-breadth", label: "Three breadth areas", detail: "One course each from analysis (MATH 2550), probability and statistics (MATH 2420 / S&DS 2420), and mathematical economics (ECON 2125).", sourceUrl: AMTH, minCourses: 3, hard: true }),
    req({ id: "amth-concentration", label: "Analysis concentration", detail: "Three further analysis-list courses, at least two numbered 3000 or higher: MATH 3020, 3050, and 3100.", sourceUrl: AMTH, minCourses: 3, hard: true }),
    req({ id: "amth-senior", label: "Senior project", detail: "AMTH 4910.", sourceUrl: AMTH, minCourses: 1, hard: true }),
  ],
  orgs: [
    bazaar("Yale Undergraduate Mathematics Society", "Academics", "Listed in the 2026 bazaar."),
    bazaar("Yale Student Quantitative Finance Organization", "Business and entrepreneurship", "Listed in the 2026 bazaar, if the economics breadth is aimed at markets."),
  ],
  milestones: [
    { when: "First and sophomore years", text: "The catalog wants multivariable calculus and linear algebra done before or during sophomore year." },
    { when: "Junior year", text: "Finish the analysis concentration. ECON 2125 is the theoretical intermediate microeconomics course and needs MATH 1180 or 1200." },
    { when: "Senior fall", text: "AMTH 4910 is listed in the fall and is starred." },
  ],
  selfStudy: mathBa.selfStudy,
};

const globalAffairs: Profile = {
  id: "global-affairs",
  career: "global",
  title: "Global Affairs",
  majorName: "Global Affairs",
  degree: "B.A.",
  summary: "The named Global Affairs sequence: economics, two political-science subfields, two history courses, quantitative analysis, and a senior essay.",
  why: [
    "Global Affairs is the Jackson School major for students whose consulting or policy interest is international rather than a straight economics Ph.D. or firm track.",
    "Three approved electives must carry the YC GLBL Elective attribute. That attribute is not on the parsed course pages, so those three courses are not invented here.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "The three YC GLBL Elective courses, and the rule that only two may be Senior Fellow electives, have to be checked in Yale Course Search.",
  ],
  placements: [],
  signature: "GLBL 2121",
  alternativeIds: ["econ-consulting"],
  slots: [
    slot("MATH 1120", "preparation"),
    slot("ECON 1115", "major", ["glbl-micro"]),
    slot("ECON 1116", "major", ["glbl-macro"]),
    slot("PLSC 1413", "major", ["glbl-plsc"]),
    slot("PLSC 1113", "major", ["glbl-plsc"]),
    slot("HIST 1220", "major", ["glbl-hist"]),
    slot("HIST 1421", "major", ["glbl-hist"]),
    slot("GLBL 2121", "major", ["glbl-quant"]),
    slot("ECON 2121", "major", ["glbl-advanced"]),
    slot("GLBL 2122", "major", ["glbl-quant-2"]),
    slot("GLBL 3101", "major", ["glbl-challenge"]),
    slot("GLBL 4500", "major", ["glbl-senior"], { senior: true }),
    ...distribution,
    ...sciencePair,
  ],
  requirements: [
    req({ id: "glbl-micro", label: "Introductory microeconomics", detail: "ECON 1108, 1110, or 1115.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-macro", label: "Introductory macroeconomics", detail: "ECON 1111 or 1116.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-plsc", label: "Two political science subfields", detail: "PLSC 1413 (comparative) and PLSC 1113 (international relations).", sourceUrl: GLBL, minCourses: 2, hard: true }),
    req({ id: "glbl-hist", label: "Two history courses", detail: "Any two courses taken under a HIST number. These two are introductory surveys listed for 2026–2027.", sourceUrl: GLBL, minCourses: 2, hard: true }),
    req({ id: "glbl-quant", label: "GLBL 2121", detail: "Applied Quantitative Analysis, ideally in the sophomore fall. It cannot count as an elective.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-advanced", label: "Advanced methods or economics", detail: "This plan uses ECON 2121, which the major lists as an acceptable advanced course.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-quant-2", label: "GLBL 2122", detail: "Required beyond the introductory eight. Prerequisite is GLBL 2121 or an approved substitute.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-challenge", label: "GLBL 3101", detail: "Challenges in Global Affairs.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-senior", label: "Senior requirement", detail: "GLBL 4500, the senior essay. GLBL 4499, the capstone, is the fall alternative.", sourceUrl: GLBL, minCourses: 1, hard: true }),
    req({ id: "glbl-electives", label: "Three YC GLBL Elective courses", detail: "Must carry the YC GLBL Elective attribute. At most two may be Senior Fellow electives. Not selected here.", sourceUrl: GLBL, minCourses: 3, hard: false }),
  ],
  orgs: [
    bazaar("Yale Policy Institute", "Politics and society", "Listed in the 2026 bazaar."),
    bazaar("Yale Political Union", "Politics and society", "Listed in the 2026 bazaar."),
    bazaar("Yale Debate Association", "Politics and society", "Listed in the 2026 bazaar."),
    bazaar("Yale Undergraduate Consulting Group (YUCG)", "Pre-professional", "Listed in the 2026 bazaar, if the global-affairs path is still aimed at consulting."),
  ],
  milestones: [
    { when: "By the end of sophomore year", text: "The major wants the eight introductory courses done before declaration, including GLBL 2121." },
    { when: "Junior year", text: "GLBL 2122 and GLBL 3101, plus Course Search for the elective attribute." },
    { when: "Summer", text: "The Jackson School encourages a summer internship. The career office there, not this plan, places students." },
    { when: "Senior spring", text: "GLBL 4500. An adviser and a second reader are the student's responsibility." },
  ],
  selfStudy: consultingStudy,
};

const mbb: Profile = {
  id: "mbb-ba",
  career: "premed",
  title: "MB&B B.A. with the premedical sciences",
  majorName: "Molecular Biophysics and Biochemistry",
  degree: "B.A.",
  summary: "Biochemistry-centered alternative to MCDB: MB&B 3000 and 3010, MB&B 2750, and the same medical-school science sequence.",
  why: [
    "MB&B requires MB&B 3000 and 3010 with no substitutions, plus a biophysical chemistry course. That is a different major from MCDB even when the premedical lectures overlap.",
    "The catalog's 0.5-credit science-and-society course MB&B 2680 is not in the 2026–2027 course list parsed here, so that half-credit is not filled with a made-up course.",
  ],
  assumptions: [
    ...sharedAssumptions,
    "MB&B 2510L is 0.5 credit. The B.A. practical-skills requirement is described as 1 credit, so this lab does not by itself finish that requirement.",
    "MB&B 4900 is the senior literature essay listed for both terms.",
  ],
  placements: [],
  signature: "MB&B 3010",
  alternativeIds: ["premed-mcdb"],
  slots: [
    slot("CHEM 1610", "prehealth", ["mbb-chem"]),
    slot("CHEM 1340L", "prehealth"),
    slot("BIOL 1010", "prehealth", ["mbb-biol"]),
    slot("BIOL 1020", "prehealth", ["mbb-biol"]),
    slot("MATH 1120", "preparation"),
    slot("CHEM 1650", "prehealth", ["mbb-chem"]),
    slot("CHEM 1360L", "prehealth"),
    slot("MATH 1150", "preparation"),
    slot("CHEM 2200", "major", ["mbb-orgo"]),
    slot("CHEM 2220L", "prehealth"),
    slot("PHYS 1700", "major", ["mbb-phys"]),
    slot("PHYS 1710", "major", ["mbb-phys"]),
    slot("MB&B 3000", "major", ["mbb-biochem"]),
    slot("MB&B 3010", "major", ["mbb-biochem"]),
    slot("MB&B 2750", "major", ["mbb-biophys"]),
    slot("MB&B 2510L", "major", ["mbb-lab"]),
    slot("MB&B 4900", "major", ["mbb-senior"], { senior: true }),
    slot("PSYC 1100", "prehealth"),
    slot("S&DS 1000", "prehealth"),
    ...distribution,
    slot("PLSC 1113", "distribution"),
  ],
  requirements: [
    req({ id: "mbb-biol", label: "Introductory biology", detail: "The MB&B catalog points majors to BIOL 1010 and 1020.", sourceUrl: MBB, minCourses: 2, hard: true }),
    req({ id: "mbb-chem", label: "General chemistry", detail: "CHEM 1610 and 1650, with labs taken alongside for medical-school preparation.", sourceUrl: MBB, minCourses: 2, hard: true }),
    req({ id: "mbb-orgo", label: "Organic chemistry", detail: "CHEM 2200 satisfies the B.A. rule of CHEM 1750 or any Chemistry course numbered 2000 or higher.", sourceUrl: MBB, minCourses: 1, hard: true }),
    req({ id: "mbb-phys", label: "Physics", detail: "PHYS 1700 and 1710 are the B.A. biophysics core's two-semester physics sequence.", sourceUrl: MBB, minCourses: 2, hard: true }),
    req({ id: "mbb-biochem", label: "Biochemistry sequence", detail: "MB&B 3000 and 3010. The catalog says substitutions are not permitted.", sourceUrl: MBB, minCourses: 2, hard: true }),
    req({ id: "mbb-biophys", label: "Biophysical chemistry", detail: "MB&B 2750 or CHEM 3320. This plan uses MB&B 2750.", sourceUrl: MBB, minCourses: 1, hard: true }),
    req({ id: "mbb-lab", label: "Biochemistry laboratory", detail: "MB&B 2510L is a listed biochemistry lab and is 0.5 credit. It does not finish a 1-credit practical-skills requirement by itself.", sourceUrl: MBB, minCourses: 1, hard: true }),
    req({ id: "mbb-senior", label: "Senior essay", detail: "MB&B 4900, the senior literature essay.", sourceUrl: MBB, minCourses: 1, hard: true }),
    req({ id: "mbb-society", label: "Science and society", detail: "The B.A. asks for 0.5 credit. MB&B 2680 is the recommended course and is not in the parsed 2026–2027 list.", sourceUrl: MBB, minCourses: 1, hard: false }),
  ],
  orgs: premed.orgs,
  milestones: premed.milestones,
  selfStudy: premed.selfStudy,
};

export const PROFILES: Profile[] = [
  econConsulting,
  quant,
  premed,
  mathBa,
  csBs,
  csBa,
  applied,
  globalAffairs,
  mbb,
];

export const PRIMARY_IDS = ["econ-consulting", "quant-sds", "premed-mcdb", "math-ba", "cs-bs"] as const;

export function getProfile(id: string): Profile | undefined {
  return PROFILES.find((profile) => profile.id === id);
}

export function matchProfile(goal: string): Profile {
  const text = goal.toLowerCase();
  const scores: Array<[string, number]> = [
    ["premed-mcdb", score(text, ["pre-med", "premed", "medical school", "physician", "doctor", "mcat"])],
    ["math-ba", score(text, ["math phd", "mathematics phd", "pure math", "graduate school in math", "math ph.d"])],
    ["quant-sds", score(text, ["quant", "quantitative finance", "hedge", "trading", "buy-side"])],
    ["econ-consulting", score(text, ["consult", "management consulting", "mckinsey", "bain", "bcg"])],
    ["cs-bs", score(text, ["artificial intelligence", "ai/", "startup", "entrepreneur", "public policy", "machine learning"])],
  ];
  if (text.includes("math") && text.includes("phd")) scores.push(["math-ba", 5]);
  scores.sort((a, b) => b[1] - a[1]);
  const winner = scores[0][1] > 0 ? scores[0][0] : "econ-consulting";
  return getProfile(winner) ?? econConsulting;
}

function score(text: string, keys: string[]): number {
  return keys.reduce((sum, key) => sum + (text.includes(key) ? 1 : 0), 0);
}

export const LOAD_SOURCE = LOADS;
export const DEGREE_SOURCE = DEGREE;
export const CAREER_OFFICE = OCS;
