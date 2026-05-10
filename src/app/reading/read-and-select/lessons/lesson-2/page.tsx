"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SavedWritingBlock } from "@/components/read-and-select/SavedWritingBlock";
import { loadPracticeJson, savePracticeJson } from "@/lib/readAndSelectPracticeStorage";

type Term = {
  term: string;
  meaning: string;
  paragraphs: [string, string];
};

const LESSON_2: {
  title: string;
  subtitle: string;
  objective: string;
  terms: Term[];
  simulator: Array<{
    id: string;
    word: string;
    isReal: boolean;
    definitionEn?: string;
  }>;
} = {
  title: "Lesson 2 · Academic Nuance",
  subtitle: "The Engineer's Voice",
  objective:
    "Learn analysis and process terms that help in technical descriptions and short essays.",
  terms: [
    {
      term: "Emphasize",
      meaning: "To give special importance to something.",
      paragraphs: [
        "In my lab report, I emphasize the main result first, so the reader understands what matters. If I start with too many details, people get lost quickly.",
        "When I speak, I emphasize key words with my voice. It helps my message sound clearer and more confident.",
      ],
    },
    {
      term: "Correlate",
      meaning: "To have a connection where two things change together.",
      paragraphs: [
        "In class, we saw that exercise can correlate with better sleep. It does not prove cause, but it shows a pattern that is worth checking.",
        "At work, I noticed that fewer errors correlate with shorter meetings. When we plan well, we usually make fewer mistakes.",
      ],
    },
    {
      term: "Hypothesis",
      meaning: "A possible explanation that you can test.",
      paragraphs: [
        "Our hypothesis was simple: warm water would dissolve the powder faster than cold water. We wrote it down before we started the experiment.",
        "After we tested it, we compared results and updated our hypothesis. Even when we are wrong, we learn something useful.",
      ],
    },
    {
      term: "Systematic",
      meaning: "Done in an organized, step-by-step way.",
      paragraphs: [
        "I use a systematic checklist before I submit an assignment. It helps me catch small errors like missing units or unclear labels.",
        "In a project, a systematic approach saves time. We follow the same steps every week, so the team does not reinvent the process.",
      ],
    },
    {
      term: "Variables",
      meaning: "Things that can change in an experiment or situation.",
      paragraphs: [
        "In our experiment, the variables were temperature and time. We kept everything else the same to make the test fair.",
        "In real life, many variables change at once. That is why we try to control what we can and write down what we cannot.",
      ],
    },
    {
      term: "Empirical",
      meaning: "Based on observation or real data, not just ideas.",
      paragraphs: [
        "We used empirical data from ten test runs to make a decision. It felt better than guessing from one example.",
        "In meetings, empirical evidence makes arguments calmer. People trust numbers and clear observations more than opinions alone.",
      ],
    },
    {
      term: "Facilitate",
      meaning: "To make something easier or help it happen.",
      paragraphs: [
        "A clear diagram can facilitate understanding when a topic is new. It gives the brain a simple map to follow.",
        "In a team, a good lead can facilitate discussion by asking the right questions. Everyone speaks more, and the plan improves.",
      ],
    },
    {
      term: "Synthesize",
      meaning: "To combine ideas or information into one clear point.",
      paragraphs: [
        "After reading three articles, I synthesize the main ideas into a short summary. I do not copy sentences; I connect the meaning.",
        "In a presentation, I synthesize feedback from different people. Then I propose one plan that most people can accept.",
      ],
    },
    {
      term: "Evaluate",
      meaning: "To judge the quality or value of something.",
      paragraphs: [
        "Before we buy new equipment, we evaluate the price, the warranty, and the reviews. It is a quick check, but it prevents bad choices.",
        "In an essay, I evaluate two solutions and explain trade-offs. I try to be fair, not emotional.",
      ],
    },
    {
      term: "Methodology",
      meaning: "The set of methods and steps used to do a study or project.",
      paragraphs: [
        "In my report, the methodology section explains what we did and why. It helps another person repeat the same steps.",
        "A clear methodology also builds trust. If the steps make sense, the result feels more believable.",
      ],
    },
  ],
  simulator: [
    {
      id: "s1",
      word: "Systematic",
      isReal: true,
      definitionEn: "Done in an organized, step-by-step way.",
    },
    { id: "s2", word: "Analysation", isReal: false },
    {
      id: "s3",
      word: "Correlate",
      isReal: true,
      definitionEn: "To have a connection where two things change together.",
    },
    {
      id: "s4",
      word: "Hypothesize",
      isReal: true,
      definitionEn: "To suggest a possible explanation that you can test.",
    },
    { id: "s5", word: "Evaluatement", isReal: false },
  ],
};

type Answer = "yes" | "no";

type Lesson2Stored = {
  simIndex: number;
  writing: string;
  writingCollapsed: boolean;
};

const LESSON_2_KEY = "lesson-2";

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

export default function Lesson2Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const selected = useMemo(
    () => LESSON_2.terms.find((t) => t.term === selectedTerm) ?? null,
    [selectedTerm],
  );

  // Practice: Read & Select simulator
  const [simIndex, setSimIndex] = useState(0);
  const [simAnswer, setSimAnswer] = useState<Answer | null>(null);
  const [simCorrect, setSimCorrect] = useState<boolean | null>(null);
  const simItem = LESSON_2.simulator[simIndex] ?? null;

  const pickSim = (a: Answer) => {
    if (!simItem) return;
    const pickedYes = a === "yes";
    const correct = pickedYes === simItem.isReal;
    setSimAnswer(a);
    setSimCorrect(correct);
  };

  const nextSim = () => {
    const next = simIndex + 1;
    if (next >= LESSON_2.simulator.length) {
      // loop for now
      setSimIndex(0);
    } else {
      setSimIndex(next);
    }
    setSimAnswer(null);
    setSimCorrect(null);
  };

  // Practice: Writing check (mass balance)
  const [writing, setWriting] = useState("");
  const [writingCollapsed, setWritingCollapsed] = useState(false);
  const [practiceHydrated, setPracticeHydrated] = useState(false);

  useEffect(() => {
    const p = loadPracticeJson<Partial<Lesson2Stored>>(LESSON_2_KEY);
    if (p) {
      if (typeof p.simIndex === "number" && p.simIndex >= 0 && p.simIndex < LESSON_2.simulator.length) {
        setSimIndex(p.simIndex);
      }
      if (typeof p.writing === "string") setWriting(p.writing);
      if (typeof p.writingCollapsed === "boolean") {
        const has = typeof p.writing === "string" && p.writing.trim().length > 0;
        setWritingCollapsed(has && p.writingCollapsed);
      }
    }
    setPracticeHydrated(true);
  }, []);

  useEffect(() => {
    if (!practiceHydrated) return;
    savePracticeJson(LESSON_2_KEY, {
      simIndex,
      writing,
      writingCollapsed,
    } satisfies Lesson2Stored);
  }, [practiceHydrated, simIndex, writing, writingCollapsed]);

  const writingFeedback = useMemo(() => {
    const terms = LESSON_2.terms.map((t) => t.term);
    const used = terms.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(writing));
    const uniqueUsed = Array.from(new Set(used.map((t) => t.toLowerCase())));
    const sentences = splitSentences(writing);
    return {
      usedUniqueCount: uniqueUsed.length,
      usedTerms: Array.from(new Set(used)),
      sentencesCount: sentences.length,
      okTerms: uniqueUsed.length >= 4,
      okLength: writing.trim().length >= 120,
      ready: writing.trim().length > 0,
    };
  }, [writing]);

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              {LESSON_2.title}
            </div>
            <div className="mt-1 text-sm text-neutral-600">{LESSON_2.subtitle}</div>
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
          <div className="mt-1 text-sm text-neutral-600">{LESSON_2.objective}</div>

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
                {LESSON_2.terms.map((t) => {
                  const active = selectedTerm === t.term;
                  return (
                    <button
                      key={t.term}
                      type="button"
                      onClick={() => setSelectedTerm((v) => (v === t.term ? null : t.term))}
                      className={[
                        "rounded-2xl border border-neutral-200 bg-white p-4 text-left transition",
                        active ? "ring-2 ring-[color:var(--brand)]/30" : "hover:border-neutral-300",
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
                  <div className="text-sm font-semibold text-neutral-900">
                    Read & Select simulator
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500">
                    Real word or not?
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-sm text-neutral-600">
                    Is this a real English word?
                  </div>
                  <div className="mt-5 text-5xl font-medium tracking-tight text-neutral-900">
                    {simItem?.word ?? "—"}
                  </div>
                </div>

                <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => pickSim("yes")}
                    disabled={simCorrect !== null}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25 disabled:opacity-60"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => pickSim("no")}
                    disabled={simCorrect !== null}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25 disabled:opacity-60"
                  >
                    No
                  </button>
                </div>

                {simCorrect !== null ? (
                  <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-neutral-900">
                        {simCorrect ? "Correct" : "Incorrect"}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {simItem?.isReal ? "Real word" : "Not a real word"}
                      </div>
                    </div>
                    {simItem?.isReal && simItem.definitionEn ? (
                      <div className="mt-3 text-sm text-neutral-700">
                        <span className="font-semibold text-neutral-900">
                          Definition:
                        </span>{" "}
                        {simItem.definitionEn}
                      </div>
                    ) : null}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={nextSim}
                        className="rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-neutral-900">Writing</div>
                  <div className="text-[11px] font-semibold text-neutral-500">
                    Use 4+ terms
                  </div>
                </div>

                <div className="mt-2 text-sm text-neutral-600">
                  Write a short mass balance description using{" "}
                  <span className="font-semibold text-neutral-900">
                    at least 4 terms
                  </span>{" "}
                  from this lesson.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {LESSON_2.terms.map((t) => (
                    <span
                      key={t.term}
                      className="rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]"
                    >
                      {t.term}
                    </span>
                  ))}
                </div>

                <SavedWritingBlock
                  value={writing}
                  onChange={setWriting}
                  collapsed={writingCollapsed}
                  onCollapsedChange={setWritingCollapsed}
                  rows={8}
                  placeholder="Example: In this assessment, the variables are mass in and mass out..."
                />

                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-neutral-900">
                      Your check
                    </div>
                    {writingFeedback.ready ? (
                      <Pill tone={writingFeedback.okTerms && writingFeedback.okLength ? "ok" : "bad"}>
                        {writingFeedback.okTerms && writingFeedback.okLength
                          ? "Looks good"
                          : "Needs work"}
                      </Pill>
                    ) : (
                      <Pill tone="neutral">Type to get feedback</Pill>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                    <div className="flex items-center justify-between gap-4">
                      <span>Use at least 4 lesson terms</span>
                      <span className="font-semibold text-neutral-900">
                        {writingFeedback.usedUniqueCount}/4
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Recommended length (≈120+ chars)</span>
                      <span className="font-semibold text-neutral-900">
                        {writing.trim().length}
                      </span>
                    </div>
                    {writingFeedback.usedTerms.length > 0 ? (
                      <div className="text-xs text-neutral-600">
                        Detected terms: {writingFeedback.usedTerms.join(", ")}
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

