import { canonical, relatedCodes } from "./catalog";

export type Expr =
  | { all: Expr[] }
  | { any: Expr[] }
  | { code: string; concurrent?: boolean };

/** Satisfied for every plan. MATH 1120 itself requires the department placement exam, which is not a course. */
export const PLACEMENT_EXAM = "MATH-PLACEMENT-EXAM";

const c = (code: string, concurrent = false): Expr => ({ code, concurrent });

const MATH_112_OR_HIGHER: Expr = {
  any: [c("MATH 1120"), c("MATH 1150"), c("MATH 1160"), c("MATH 1180"), c("MATH 1200"), c("MATH 2250")],
};

const INTRO_MICRO: Expr = { any: [c("ECON 1108"), c("ECON 1110"), c("ECON 1115")] };
const INTRO_MACRO: Expr = { any: [c("ECON 1111"), c("ECON 1116")] };

export const PREREQS: Record<string, Expr> = {
  "MATH 1120": c(PLACEMENT_EXAM),
  "MATH 1150": { any: [c("MATH 1120"), c("MATH 1110")] },
  "MATH 1180": c("MATH 1120"),
  "MATH 1200": { any: [c("MATH 1150"), c("MATH 1160")] },
  "MATH 2250": c("MATH 1150"),
  "MATH 2440": c("MATH 1150"),
  "MATH 2460": { all: [c("MATH 1200"), { any: [c("MATH 2220", true), c("MATH 2250", true), c("MATH 2260", true)] }] },
  "MATH 2550": { all: [c("MATH 2250"), c("MATH 1150")] },
  "MATH 3020": { all: [c("MATH 2250"), c("MATH 2550")] },
  "MATH 3050": { all: [c("MATH 2250"), c("MATH 2550")] },
  "MATH 3100": { all: [c("MATH 2250"), c("MATH 2550"), { any: [c("MATH 3020"), c("MATH 1200")] }] },
  "MATH 3500": { all: [c("MATH 2250"), c("MATH 2550")] },
  "MATH 3700": c("MATH 3500"),
  "MATH 2410": { any: [c("MATH 1200", true), c("MATH 1180", true)] },
  "MATH 2420": { all: [c("MATH 2410"), { any: [c("MATH 2220", true), c("MATH 2250", true)] }] },

  "SPAN 1400": c("SPAN 1300"),

  "ECON 1116": INTRO_MICRO,
  "ECON 1117": { all: [INTRO_MICRO, MATH_112_OR_HIGHER] },
  "ECON 2121": { all: [INTRO_MICRO, MATH_112_OR_HIGHER] },
  "ECON 2122": { all: [INTRO_MICRO, INTRO_MACRO, MATH_112_OR_HIGHER] },
  "ECON 2123": { all: [INTRO_MICRO, c("ECON 1117"), MATH_112_OR_HIGHER] },
  "ECON 2125": { all: [INTRO_MICRO, { any: [c("MATH 1180"), c("MATH 1200")] }] },
  "ECON 2251": INTRO_MICRO,
  "ECON 2259": INTRO_MICRO,
  "ECON 3303": { all: [INTRO_MICRO, c("ECON 1117")] },
  "ECON 4409": { any: [c("ECON 2121"), c("ECON 2125")] },
  "ECON 4424": {
    all: [
      { any: [c("ECON 2121"), c("ECON 2125")] },
      { any: [c("ECON 2122"), c("ECON 2126")] },
      { any: [c("ECON 1117"), c("ECON 2123")] },
    ],
  },
  "ECON 2135": {
    all: [INTRO_MICRO, { any: [c("MATH 1180"), c("MATH 1200")] }, { any: [c("MATH 2220"), c("MATH 2250")] }],
  },
  "ECON 2136": { any: [c("ECON 2135"), { all: [c("MATH 2410"), c("MATH 2420")] }] },
  "ECON 3351": { all: [{ any: [c("MATH 1180"), c("MATH 1200")] }, { any: [c("ECON 2121"), c("ECON 2125")] }] },

  "CPSC 2010": { any: [c("CPSC 1001"), c("CPSC 1100")] },
  "CPSC 2230": { any: [c("CPSC 2010"), c("CPSC 2000")] },
  "CPSC 3230": c("CPSC 2230"),
  "CPSC 3270": c("CPSC 2230"),
  "CPSC 3650": { all: [{ any: [c("CPSC 2020"), c("MATH 2440")] }, c("CPSC 2230")] },
  "CPSC 4390": c("CPSC 3230"),
  "CPSC 4550": c("CPSC 3650"),
  "CPSC 4740": { all: [c("CPSC 2020"), c("CPSC 2230")] },
  "CPSC 4770": { any: [c("CPSC 3810"), c("S&DS 3650")] },

  "S&DS 2300": { any: [c("S&DS 1000"), c("S&DS 1080"), c("S&DS 1090"), c("S&DS 1230")] },
  "S&DS 2380": { any: [c("MATH 1180", true), c("MATH 1200", true)] },
  "S&DS 3120": { all: [c("MATH 2420"), { any: [c("MATH 2220"), c("MATH 2250")] }] },
  "S&DS 3650": { all: [c("MATH 2420"), { any: [c("MATH 2220"), c("MATH 2250")] }] },

  "CHEM 1340L": { any: [c("CHEM 1610", true), c("CHEM 1630", true)] },
  "CHEM 1360L": { all: [c("CHEM 1340L"), { any: [c("CHEM 1650", true), c("CHEM 1670", true)] }] },
  "CHEM 1650": c("CHEM 1610"),
  "CHEM 2200": { all: [c("CHEM 1610"), c("CHEM 1650")] },
  "CHEM 2220L": { any: [c("CHEM 2200", true), c("CHEM 1740", true)] },

  "PHYS 1700": { any: [c("MATH 1120"), c("MATH 1150"), c("MATH 1160"), c("MATH 1200")] },
  "PHYS 1710": c("PHYS 1700"),
  "PHYS 1650L": c("PHYS 1700", true),
  "PHYS 1660L": { all: [c("PHYS 1650L"), c("PHYS 1710", true)] },

  "BIOL 1020": c("BIOL 1010", true),
  "BIOL 1030": { all: [c("BIOL 1010"), c("BIOL 1020")] },
  "BIOL 1040": { all: [c("BIOL 1010"), c("BIOL 1020"), c("BIOL 1030", true)] },
  "MB&B 2510L": c("BIOL 1010"),
  "MCDB 2000": { all: [c("CHEM 1610"), c("BIOL 1010")] },
  "MCDB 2010L": c("MCDB 2000", true),
  "MCDB 2020": c("BIOL 1030"),
  "MCDB 2050": { all: [c("BIOL 1010"), c("BIOL 1020")] },
  "MB&B 2750": { all: [c("BIOL 1010"), c("BIOL 1020"), c("MATH 1120"), c("CHEM 1610")] },
  "MB&B 3000": { all: [c("BIOL 1010"), { any: [c("CHEM 2200"), c("CHEM 1740")] }] },
  "MB&B 3010": c("MB&B 3000"),

  "GLBL 2122": { any: [c("GLBL 2121"), c("ECON 1117"), c("ECON 2123"), c("ECON 2135")] },
};

const EXCLUSIVE: string[][] = [
  ["ECON 1108", "ECON 1110", "ECON 1115"],
  ["ECON 1111", "ECON 1116"],
  ["ECON 2121", "ECON 2125"],
  ["ECON 2122", "ECON 2126"],
  ["CPSC 3650", "CPSC 3660"],
];

export function prereqFor(code: string): Expr | undefined {
  for (const key of relatedCodes(code)) {
    if (PREREQS[key]) return PREREQS[key];
  }
  return PREREQS[canonical(code)];
}

export function exclusiveConflict(codes: string[]): string[] | undefined {
  const canon = new Set(codes.map(canonical));
  for (const group of EXCLUSIVE) {
    const hit = group.filter((code) => canon.has(canonical(code)));
    if (hit.length > 1) return hit;
  }
  return undefined;
}

export function exprSatisfied(expr: Expr, earlier: Set<string>, sameTerm: Set<string>): boolean {
  if ("code" in expr) {
    const code = canonical(expr.code);
    if (earlier.has(code) || earlier.has(expr.code)) return true;
    if (expr.concurrent && (sameTerm.has(code) || sameTerm.has(expr.code))) return true;
    return false;
  }
  if ("all" in expr) return expr.all.every((item) => exprSatisfied(item, earlier, sameTerm));
  return expr.any.some((item) => exprSatisfied(item, earlier, sameTerm));
}
