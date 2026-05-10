"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Term = {
  term: string;
  meaning: string;
  paragraphs: [string, string];
};

const LESSON_1: {
  title: string;
  subtitle: string;
  objective: string;
  terms: Term[];
  matching: Array<{
    id: string;
    prompt: string;
    answer: string;
  }>;
} = {
  title: "Lesson 1 · Business & Workplace",
  subtitle: "The Consultant's Path",
  objective:
    "Master product management and consulting terms to sound professional on the DET.",
  terms: [
    {
      term: "Leverage",
      meaning: "To use something to maximum advantage.",
      paragraphs: [
        "Our team is small, so we cannot waste time. We decided to leverage the contacts we already have from last year’s conference instead of cold-calling hundreds of new companies. People are more likely to reply when they remember your name.",
        "We also leverage simple survey answers from early users to decide what to build next. It is not perfect data, but it is honest feedback we can act on this month.",
      ],
    },
    {
      term: "Stakeholder",
      meaning: "A person or group affected by a project’s outcome.",
      paragraphs: [
        "Before we change the app, we list every stakeholder who might care: the sales team, the support desk, and our finance colleague who checks invoices. If we forget someone, we often hear about it too late.",
        "Last week one stakeholder asked for a shorter report. Another only wanted a weekly email. When we listen early, the project feels calmer for everyone.",
      ],
    },
    {
      term: "Streamline",
      meaning: "To simplify a process to make it faster and more efficient.",
      paragraphs: [
        "New hires used to sign six different forms on their first day. HR worked with IT to streamline onboarding so most steps happen online before day one. People now arrive ready to work instead of stuck in paperwork.",
        "We also streamlined how we approve small expenses under fifty dollars. One manager can say yes, and the team saves a lot of waiting time.",
      ],
    },
    {
      term: "Feasibility",
      meaning: "How realistic or achievable something is.",
      paragraphs: [
        "The client wanted a new mobile app in six weeks. We wrote a short feasibility note with costs, risks, and an honest timeline. We said it was possible only if they reduced the first version to a few core screens.",
        "Checking feasibility early saved us from a stressful promise we could not keep. The client chose a smaller first release, and the mood in the meetings improved.",
      ],
    },
    {
      term: "Roadmap",
      meaning: "A plan that shows what will be built and when.",
      paragraphs: [
        "Our product roadmap shows three big goals for the year: fix bugs, add payments, then add a simple dashboard. Everyone on Slack can open the same page, so there are fewer arguments about “what comes first.”",
        "When priorities change, we update the roadmap together in the Friday meeting. People feel less anxious when they can see the plan in plain language.",
      ],
    },
    {
      term: "Bottleneck",
      meaning: "A point that slows down progress.",
      paragraphs: [
        "Shipments were late because one warehouse gate became a bottleneck every Monday morning. Trucks waited in a long line while only one person checked paperwork.",
        "After we added a second check-in desk and a simple digital list, the bottleneck disappeared. Small changes sometimes fix big delays.",
      ],
    },
    {
      term: "KPI",
      meaning: "A key performance indicator; a metric that measures success.",
      paragraphs: [
        "Our team chose one KPI we all understand: customer replies within twenty-four hours. We track it on a whiteboard near the coffee machine so it stays visible.",
        "If the KPI goes down for two weeks, we stop adding new tasks and fix the support process first. One clear number is easier than ten confusing charts.",
      ],
    },
    {
      term: "Scalability",
      meaning: "The ability to handle growth without breaking down.",
      paragraphs: [
        "Our shop started with fifty orders a week, but we hope to grow fast next year. We asked an engineer about scalability: can the website stay fast if traffic doubles?",
        "We paid a bit more now for a simple cloud setup with scalability in mind. We sleep better knowing the system can grow without a full rebuild every six months.",
      ],
    },
    {
      term: "Deliverable",
      meaning: "A concrete output that must be delivered.",
      paragraphs: [
        "The contract says our main deliverable for March is a working login page and a short user guide. If it is not in the contract, we politely say it is out of scope.",
        "When the deliverable is clear, the team argues less about “what is done.” We check the list, send the files, and celebrate a small win.",
      ],
    },
    {
      term: "Implementation",
      meaning: "The process of putting a plan into action.",
      paragraphs: [
        "We spent hours on a nice strategy deck, but real progress starts at implementation. Our manager split the plan into weekly tasks and wrote names next to each item.",
        "During implementation we had daily fifteen-minute calls. Problems still appeared, but we fixed them quickly because everyone knew who to call.",
      ],
    },
  ],
  matching: [
    {
      id: "m1",
      prompt: "To ____ a process and remove extra steps",
      answer: "Streamline",
    },
    {
      id: "m2",
      prompt: "A metric used to track progress (abbreviation): ____",
      answer: "KPI",
    },
    {
      id: "m3",
      prompt: "A plan of what to build over time: ____",
      answer: "Roadmap",
    },
    {
      id: "m4",
      prompt: "A slowdown point in a workflow: ____",
      answer: "Bottleneck",
    },
    {
      id: "m5",
      prompt: "A required project output: ____",
      answer: "Deliverable",
    },
    {
      id: "m6",
      prompt: "To use something to maximum advantage (verb): ____",
      answer: "Leverage",
    },
    {
      id: "m7",
      prompt: "A person or group affected by outcomes: ____",
      answer: "Stakeholder",
    },
    {
      id: "m8",
      prompt: "How realistic a plan is (noun): ____",
      answer: "Feasibility",
    },
    {
      id: "m9",
      prompt: "Ability to handle growth without failing: ____",
      answer: "Scalability",
    },
    {
      id: "m10",
      prompt: "Putting a plan into action (noun): ____",
      answer: "Implementation",
    },
  ],
};

function normalizeAnswer(s: string) {
  return s.trim().toLowerCase();
}

function answersMatch(input: string, expected: string) {
  return normalizeAnswer(input) === normalizeAnswer(expected);
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "bad" | "neutral";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : tone === "bad"
        ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
        : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Lesson1Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const selected = useMemo(
    () => LESSON_1.terms.find((t) => t.term === selectedTerm) ?? null,
    [selectedTerm],
  );

  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [drill, setDrill] = useState<string>("");

  const drillFeedback = useMemo(() => {
    const sentences = splitSentences(drill);
    const used = LESSON_1.terms
      .map((t) => t.term)
      .filter((term) => new RegExp(`\\b${term}\\b`, "i").test(drill));

    const okSentences = sentences.length >= 3;
    const okUsed = used.length >= 3;

    return {
      sentences,
      used,
      okSentences,
      okUsed,
      ready: drill.trim().length > 0,
    };
  }, [drill]);

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              {LESSON_1.title}
            </div>
            <div className="mt-1 text-sm text-neutral-600">{LESSON_1.subtitle}</div>
          </div>
          <Link
            href="/reading/read-and-select/lessons"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4 sm:px-6">
          <div className="text-sm font-semibold text-neutral-900">Objective</div>
          <div className="mt-1 text-sm text-neutral-600">{LESSON_1.objective}</div>

          <div className="mt-4 inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => setTab("learn")}
              className={[
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                tab === "learn"
                  ? "bg-white text-[color:var(--brand)] ring-1 ring-neutral-200"
                  : "text-neutral-600 hover:text-neutral-900",
              ].join(" ")}
            >
              Learn
            </button>
            <button
              type="button"
              onClick={() => setTab("practice")}
              className={[
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                tab === "practice"
                  ? "bg-white text-[color:var(--brand)] ring-1 ring-neutral-200"
                  : "text-neutral-600 hover:text-neutral-900",
              ].join(" ")}
            >
              Practice
            </button>
          </div>
        </div>

        {tab === "learn" ? (
          <div className="border-t border-neutral-200 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {LESSON_1.terms.map((t) => {
                  const active = selectedTerm === t.term;
                  return (
                    <button
                      key={t.term}
                      type="button"
                      onClick={() => setSelectedTerm((v) => (v === t.term ? null : t.term))}
                      className={[
                        "rounded-2xl border border-neutral-200 bg-white p-4 text-left transition",
                        active
                          ? "ring-2 ring-[color:var(--brand)]/30"
                          : "hover:border-neutral-300",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-neutral-900">
                          {t.term}
                        </div>
                        <Pill tone={active ? "ok" : "neutral"}>
                          {active ? "Selected" : "Tap"}
                        </Pill>
                      </div>
                      <div className="mt-2 text-xs text-neutral-600">{t.meaning}</div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">In context</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Select a term to read two short paragraphs where it appears naturally.
                </div>
                {selected ? (
                  <div className="mt-4 space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand)]">
                        {selected.term}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                        {selected.paragraphs[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm leading-relaxed text-neutral-800">
                        {selected.paragraphs[1]}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    Tap any word on the left.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-200 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-neutral-900">Matching</div>
                  <div className="text-[11px] font-semibold text-neutral-500">
                    Type the correct term
                  </div>
                </div>

                <div className="mt-4 grid max-h-[min(70vh,720px)] gap-3 overflow-y-auto pr-1">
                  {LESSON_1.matching.map((m) => {
                    const typed = typedAnswers[m.id] ?? "";
                    const status =
                      typed.trim().length === 0
                        ? "neutral"
                        : answersMatch(typed, m.answer)
                          ? "ok"
                          : "bad";
                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm text-neutral-800">{m.prompt}</div>
                          <Pill tone={status}>
                            {status === "neutral"
                              ? "Type answer"
                              : status === "ok"
                                ? "Correct"
                                : "Incorrect"}
                          </Pill>
                        </div>

                        <div className="mt-3">
                          <label className="sr-only" htmlFor={`inp-${m.id}`}>
                            Type the missing term
                          </label>
                          <input
                            id={`inp-${m.id}`}
                            type="text"
                            autoComplete="off"
                            spellCheck={false}
                            value={typed}
                            onChange={(e) =>
                              setTypedAnswers((prev) => ({
                                ...prev,
                                [m.id]: e.target.value,
                              }))
                            }
                            placeholder="Type the word…"
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-neutral-900">Drill</div>
                  <div className="text-[11px] font-semibold text-neutral-500">
                    Write 3 sentences
                  </div>
                </div>

                <div className="mt-2 text-sm text-neutral-600">
                  Write <span className="font-semibold text-neutral-900">3 sentences</span>{" "}
                  about an Alphisol project using these words.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {LESSON_1.terms.map((t) => (
                    <span
                      key={t.term}
                      className="rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]"
                    >
                      {t.term}
                    </span>
                  ))}
                </div>

                <textarea
                  value={drill}
                  onChange={(e) => setDrill(e.target.value)}
                  rows={7}
                  className="mt-4 w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                  placeholder="Example: We leveraged stakeholder input to streamline the implementation..."
                />

                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-neutral-900">Your check</div>
                    {drillFeedback.ready ? (
                      <Pill tone={drillFeedback.okSentences && drillFeedback.okUsed ? "ok" : "bad"}>
                        {drillFeedback.okSentences && drillFeedback.okUsed
                          ? "Looks good"
                          : "Needs work"}
                      </Pill>
                    ) : (
                      <Pill tone="neutral">Type to get feedback</Pill>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                    <div className="flex items-center justify-between gap-4">
                      <span>At least 3 sentences</span>
                      <span className="font-semibold text-neutral-900">
                        {drillFeedback.sentences.length}/3
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Use at least 3 lesson terms</span>
                      <span className="font-semibold text-neutral-900">
                        {drillFeedback.used.length}/3
                      </span>
                    </div>
                    {drillFeedback.used.length > 0 ? (
                      <div className="text-xs text-neutral-600">
                        Detected terms: {drillFeedback.used.join(", ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
