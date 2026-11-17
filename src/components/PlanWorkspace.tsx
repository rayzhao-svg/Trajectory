"use client";

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CourseView, PlanView } from "@/lib/view";

const TABS = ["Timeline", "Major", "Requirements", "Career", "Self-study", "Compare"] as const;

export function PlanWorkspace({ id }: { id: string }) {
  const [plan, setPlan] = useState<PlanView | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Timeline");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<CourseView | null>(null);
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    void fetch(`/api/plans/${id}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Could not load the plan.");
        setPlan(body);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [id]);

  async function mutate(path: string, payload: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "That change was rejected.");
      return;
    }
    setPlan(body);
    setMessage(body.message ?? "");
    if (selected) {
      const next = body.semesters.flatMap((semester: { courses: CourseView[] }) => semester.courses).find((course: CourseView) => course.code === selected.code);
      setSelected(next ?? null);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const over = event.over?.id?.toString() ?? "";
    if (!over.startsWith("sem-")) return;
    void mutate(`/api/plans/${id}/move`, { code: String(event.active.id), semester: Number(over.slice(4)) });
  }

  if (error) {
    return <main className="shell" style={{ padding: 48 }}><p>{error}</p><Link href="/">Back</Link></main>;
  }
  if (!plan) return <main className="shell" style={{ padding: 48 }}>Loading the plan…</main>;

  return (
    <main className="shell" style={{ padding: "28px 0 64px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <Link href="/" className="meta" style={{ fontSize: 13 }}>Trajectory</Link>
          <h1 className="serif" style={{ fontSize: 40, lineHeight: 1, margin: "8px 0" }}>{plan.majorName}, {plan.degree}</h1>
          <p style={{ margin: 0, maxWidth: 680 }}>{plan.goal}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="meta">{plan.progress.done}/{plan.progress.total} requirements · {plan.credits} credits</span>
          <a className="primary" href={`/api/plans/${id}/pdf`} style={{ textDecoration: "none" }}>Export PDF</a>
        </div>
      </header>
      {message ? <p className="card" style={{ padding: "10px 14px" }}>{message}</p> : null}
      {plan.errors.length > 0 ? (
        <div className="card" style={{ padding: 14, borderColor: "#e2c4a2" }}>
          {plan.errors.map((issue) => <p key={issue.message} style={{ margin: "4px 0", color: "var(--warn)" }}>{issue.message}</p>)}
        </div>
      ) : null}
      <nav className="tabs" style={{ margin: "18px 0" }}>
        {TABS.map((item) => (
          <button key={item} type="button" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>
        ))}
      </nav>
      {tab === "Timeline" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="years">
            {[0, 1, 2, 3].map((year) => (
              <section key={year}>
                <h2 className="serif" style={{ fontSize: 22, margin: "0 0 8px" }}>Year {year + 1}</h2>
                {plan.semesters.filter((semester) => Math.floor(semester.index / 2) === year).map((semester) => (
                  <SemesterColumn key={semester.index} semester={semester} onOpen={setSelected} />
                ))}
              </section>
            ))}
          </div>
        </DndContext>
      ) : null}
      {tab === "Major" ? <Major plan={plan} /> : null}
      {tab === "Requirements" ? <Requirements plan={plan} /> : null}
      {tab === "Career" ? <Career plan={plan} /> : null}
      {tab === "Self-study" ? <Study plan={plan} /> : null}
      {tab === "Compare" ? <Compare plan={plan} goal={plan.goal} /> : null}
      {selected ? (
        <CourseDrawer
          course={selected}
          onClose={() => setSelected(null)}
          onComplete={(completed) => void mutate(`/api/plans/${id}/complete`, { code: selected.code, completed })}
          onSwap={(replacement) => void mutate(`/api/plans/${id}/swap`, { code: selected.code, replacement })}
        />
      ) : null}
    </main>
  );
}

function SemesterColumn({ semester, onOpen }: { semester: PlanView["semesters"][number]; onOpen: (course: CourseView) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `sem-${semester.index}` });
  return (
    <div ref={setNodeRef} className="card" style={{ padding: 10, marginBottom: 10, outline: isOver ? "2px solid var(--accent)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>{semester.label.replace(/Year \d+ · /, "")}</strong>
        <span className="meta">{semester.credits} cr</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {semester.courses.map((course) => (
          <CourseCard key={course.code} course={course} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: CourseView; onOpen: (course: CourseView) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: course.code });
  return (
    <button
      ref={setNodeRef}
      className={course.completed ? "course done" : "course"}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => onOpen(course)}
    >
      <strong>{course.displayCode}</strong>
      <div style={{ fontSize: 14 }}>{course.title}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
        <span className="pill">{course.credits} cr</span>
        {course.designations.map((item) => <span className="pill" key={item}>{item}</span>)}
        {course.starred ? <span className="pill">Limited</span> : null}
      </div>
    </button>
  );
}

function Major({ plan }: { plan: PlanView }) {
  return (
    <section className="card" style={{ padding: 22 }}>
      <h2 className="serif" style={{ marginTop: 0 }}>{plan.title}</h2>
      <p>{plan.summary}</p>
      {plan.why.map((item) => <p key={item}>{item}</p>)}
      <h3>Assumptions</h3>
      <ul>{plan.notes.map((note) => <li key={note}>{note}</li>)}</ul>
    </section>
  );
}

function Requirements({ plan }: { plan: PlanView }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {plan.requirements.map((item) => (
        <article key={item.id} className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <strong>{item.label}</strong>
            <span style={{ color: item.status === "met" ? "var(--ok)" : "var(--warn)" }}>{item.status.replace("-", " ")}</span>
          </div>
          <p className="meta">{item.detail}</p>
          <p style={{ marginBottom: 0 }}>{item.courses.join(", ") || "Nothing assigned yet."}</p>
          <a href={item.sourceUrl}>Source</a>
        </article>
      ))}
      {plan.warnings.length > 0 ? (
        <article className="card" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Checks to confirm</h3>
          <ul>{plan.warnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}</ul>
        </article>
      ) : null}
    </div>
  );
}

function Career({ plan }: { plan: PlanView }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card" style={{ padding: 18 }}>
        <h2 className="serif" style={{ marginTop: 0 }}>Organizations</h2>
        <p className="meta">Names come from the Yale College Extracurricular Bazaar 2026 quick map. Membership and activity are not verified beyond that listing.</p>
        {plan.orgs.map((org) => (
          <p key={org.name}><strong>{org.name}</strong> · {org.category}<br />{org.why} <a href={org.sourceUrl}>Source</a></p>
        ))}
      </section>
      <section className="card" style={{ padding: 18 }}>
        <h2 className="serif" style={{ marginTop: 0 }}>Milestones</h2>
        {plan.milestones.map((item) => <p key={item.when}><strong>{item.when}.</strong> {item.text}</p>)}
      </section>
    </div>
  );
}

function Study({ plan }: { plan: PlanView }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {plan.selfStudy.map((item) => (
        <article key={item.title} className="card" style={{ padding: 16 }}>
          <p className="meta" style={{ marginTop: 0 }}>{item.kind}</p>
          <h3 className="serif" style={{ margin: "4px 0" }}>{item.title}</h3>
          <p>{item.why}</p>
          <p><strong>When:</strong> {item.timeline}</p>
          <a href={item.url}>Open the source</a>
        </article>
      ))}
    </div>
  );
}

function Compare({ plan, goal }: { plan: PlanView; goal: string }) {
  const [pending, setPending] = useState("");
  async function open(profileId: string) {
    setPending(profileId);
    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, profileId }),
    });
    const body = await response.json();
    if (response.ok) window.location.href = `/plan/${body.id}`;
    setPending("");
  }
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      <article className="card" style={{ padding: 16, background: "var(--accent-soft)" }}>
        <p className="meta">Current plan</p>
        <h3 className="serif">{plan.majorName}, {plan.degree}</h3>
        <p>{plan.summary}</p>
      </article>
      {plan.alternatives.map((item) => (
        <article key={item.id} className="card" style={{ padding: 16 }}>
          <p className="meta">{item.degree}</p>
          <h3 className="serif">{item.majorName}</h3>
          <p>{item.summary}</p>
          <button className="primary" type="button" onClick={() => void open(item.id)} disabled={pending === item.id}>
            {pending === item.id ? "Building…" : "Open this plan"}
          </button>
        </article>
      ))}
    </div>
  );
}

function CourseDrawer({
  course,
  onClose,
  onComplete,
  onSwap,
}: {
  course: CourseView;
  onClose: () => void;
  onComplete: (completed: boolean) => void;
  onSwap: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ code: string; displayCode: string; title: string }>>([]);
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      void fetch(`/api/courses?q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((body) => setResults(body.courses ?? []));
    }, 180);
    return () => clearTimeout(handle);
  }, [query]);
  return (
    <aside className="card" style={{ position: "fixed", right: 16, bottom: 16, width: "min(420px, calc(100% - 32px))", maxHeight: "70vh", overflow: "auto", padding: 16, zIndex: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{course.displayCode}</strong>
        <button className="ghost" type="button" onClick={onClose}>Close</button>
      </div>
      <h2 className="serif" style={{ margin: "8px 0" }}>{course.title}</h2>
      <p className="meta">{course.credits} credits · {course.creditStatus} · {course.terms.join(", ") || "term not printed"}</p>
      <p>{course.description}</p>
      {course.note ? <p>{course.note}</p> : null}
      <p><a href={course.sourceUrl}>Catalog page</a></p>
      <button className="ghost" style={{ border: "1px solid var(--line)" }} type="button" onClick={() => onComplete(!course.completed)}>
        {course.completed ? "Mark as not completed" : "Mark completed"}
      </button>
      <label style={{ display: "block", marginTop: 14 }}>
        Swap for another catalog course
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by code or title" style={{ width: "100%", marginTop: 6, padding: 8, borderRadius: 8, border: "1px solid var(--line)" }} />
      </label>
      <ul style={{ paddingLeft: 18 }}>
        {results.map((result) => (
          <li key={result.code}>
            <button className="ghost" type="button" onClick={() => onSwap(result.code)}>{result.displayCode}: {result.title}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
