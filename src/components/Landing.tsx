"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = [
  "I want to work in management consulting after Yale.",
  "I want a career in quantitative finance.",
  "I am pre-med and want to apply to medical school.",
  "I want to get a mathematics PhD.",
  "I want to combine AI, entrepreneurship, and public policy.",
];

export function Landing() {
  const router = useRouter();
  const [goal, setGoal] = useState(EXAMPLES[0]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(text: string) {
    setPending(true);
    setError("");
    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: text }),
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? "The plan could not be created.");
      return;
    }
    router.push(`/plan/${body.id}`);
  }

  return (
    <main className="shell" style={{ padding: "72px 0 80px" }}>
      <p className="meta" style={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12 }}>
        Yale College · Class planning
      </p>
      <h1 className="serif" style={{ fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 0.95, fontWeight: 450, margin: "12px 0 16px", maxWidth: 760 }}>
        Four years, drawn from the catalog rather than a guess.
      </h1>
      <p style={{ maxWidth: 640, fontSize: 19, lineHeight: 1.45, color: "var(--muted)" }}>
        Describe where you want a Yale education to lead. Trajectory recommends a major, then builds an eight-semester schedule that a rules engine checks against prerequisites, credits, and degree requirements.
      </p>
      <form
        className="card"
        style={{ marginTop: 28, padding: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          void submit(goal);
        }}
      >
        <label htmlFor="goal" className="meta" style={{ display: "block", marginBottom: 8 }}>
          What do you want to do after Yale?
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          rows={4}
          style={{ width: "100%", border: 0, resize: "vertical", background: "transparent", outline: "none", fontSize: 18 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <p className="meta" style={{ margin: 0, fontSize: 13 }}>
            Plans use the 2026–2027 Yale College Programs of Study. Later sections are tentative.
          </p>
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Building the plan…" : "Build my plan"}
          </button>
        </div>
        {error ? <p style={{ color: "var(--warn)" }}>{error}</p> : null}
      </form>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {EXAMPLES.map((example) => (
          <button key={example} className="ghost" style={{ border: "1px solid var(--line)", background: "white" }} type="button" onClick={() => void submit(example)}>
            {example.replace(/\.$/, "")}
          </button>
        ))}
      </div>
    </main>
  );
}
