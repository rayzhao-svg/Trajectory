import assert from "node:assert/strict";
import test from "node:test";
import { getCourse } from "../src/lib/catalog";
import { buildProfilePlan } from "../src/lib/engine";
import { prereqFor } from "../src/lib/prereqs";
import { PRIMARY_IDS, PROFILES, matchProfile } from "../src/lib/profiles";

for (const profile of PROFILES) {
  test(`plan ${profile.id} satisfies hard constraints`, () => {
    const { plan, report } = buildProfilePlan(profile);
    const scheduled = plan.semesters.flatMap((semester) => semester.courses.map((course) => course.code));
    for (const code of scheduled) {
      const course = getCourse(code);
      assert.ok(course, code);
      if (course && course.hasPrerequisiteLanguage && !prereqFor(code) && course.code !== "MATH 1120") {
        assert.fail(`${profile.id} schedules ${code} but its prerequisite sentence is not encoded`);
      }
    }
    assert.deepEqual(
      report.errors,
      [],
      report.errors.map((error) => error.message).join("\n"),
    );
    assert.ok(report.credits >= 36, `${profile.id} credits ${report.credits}`);
    for (const semester of plan.semesters) {
      const credits = semester.courses.reduce((sum, course) => sum + (getCourse(course.code)?.credits ?? 0), 0);
      assert.ok(credits >= 4 && credits <= 5.5, `${profile.id} ${semester.label} ${credits}`);
    }
  });
}

test("the five career plans are meaningfully different", () => {
  const sets = PRIMARY_IDS.map((id) => {
    const profile = PROFILES.find((item) => item.id === id)!;
    const { plan } = buildProfilePlan(profile);
    return new Set(plan.semesters.flatMap((semester) => semester.courses.map((course) => course.code)));
  });
  for (let i = 0; i < sets.length; i += 1) {
    for (let j = i + 1; j < sets.length; j += 1) {
      const overlap = [...sets[i]].filter((code) => sets[j].has(code)).length;
      const union = new Set([...sets[i], ...sets[j]]).size;
      assert.ok(overlap / union < 0.62, `${PRIMARY_IDS[i]} vs ${PRIMARY_IDS[j]} overlap ${overlap}/${union}`);
    }
  }
  const signatures = new Map(PRIMARY_IDS.map((id) => [PROFILES.find((item) => item.id === id)!.signature, id]));
  for (const id of PRIMARY_IDS) {
    const profile = PROFILES.find((item) => item.id === id)!;
    const { plan } = buildProfilePlan(profile);
    const codes = new Set(plan.semesters.flatMap((semester) => semester.courses.map((course) => course.code)));
    assert.ok(codes.has(profile.signature) || [...codes].some((code) => code === profile.signature), profile.id);
    for (const [signature, owner] of signatures) {
      if (owner !== id) assert.equal(codes.has(signature), false, `${id} unexpectedly includes ${signature}`);
    }
  }
});

test("sample goals select different majors", () => {
  assert.equal(matchProfile("I want to work in management consulting after Yale.").id, "econ-consulting");
  assert.equal(matchProfile("I want a career in quantitative finance.").id, "quant-sds");
  assert.equal(matchProfile("I am pre-med and want to apply to medical school.").id, "premed-mcdb");
  assert.equal(matchProfile("I want to get a mathematics PhD.").id, "math-ba");
  assert.equal(matchProfile("I want to combine AI, entrepreneurship, and public policy.").id, "cs-bs");
});
