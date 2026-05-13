"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GrammarHints } from "@/components/read-and-select/GrammarHints";
import { loadPracticeJson, savePracticeJson } from "@/lib/readAndSelectPracticeStorage";

type Term = {
  term: string;
  meaning: string;
  paragraphs: [string, string];
};

const LESSON_4 = {
  title: "Lesson 4 · Abstract Concepts & Qualities",
  subtitle: "B2 Precision",
  objective:
    "Use precise adjectives and abstract nouns so you do not rely on vague words like good or bad in academic and professional English.",
  terms: [
    {
      term: "Ubiquitous",
      meaning: "Seeming to be everywhere; extremely common in a context.",
      paragraphs: [
        "Mobile notifications feel ubiquitous in modern work life, which makes deep focus harder unless you set boundaries.",
        "Be careful: ubiquitous does not mean universal; it describes a strong sense of presence, not absolute truth.",
      ],
    },
    {
      term: "Resilience",
      meaning: "The ability to recover from difficulty; strength under stress (noun).",
      paragraphs: [
        "Teams show resilience when a launch fails but they keep morale steady and run a calm retrospective.",
        "In essays, resilience pairs well with evidence: timelines, metrics, and concrete decisions after a setback.",
      ],
    },
    {
      term: "Ambiguous",
      meaning: "Unclear because more than one interpretation is possible.",
      paragraphs: [
        "An ambiguous requirement creates rework because engineers guess instead of align.",
        "Legal language can be intentionally ambiguous; in product specs, you usually want the opposite.",
      ],
    },
    {
      term: "Fundamental",
      meaning: "Central and essential; forming a necessary foundation.",
      paragraphs: [
        "Trust is fundamental in financial products; without it, clever features do not matter.",
        "We missed a fundamental assumption about peak traffic, so the architecture failed at the worst moment.",
      ],
    },
    {
      term: "Substantial",
      meaning: "Large or important in amount, degree, or effect.",
      paragraphs: [
        "The team made substantial progress in two weeks by cutting scope and shipping one workflow end-to-end.",
        "A substantial risk remains if we depend on a single vendor for identity.",
      ],
    },
    {
      term: "Versatile",
      meaning: "Able to adapt to many tasks, situations, or uses.",
      paragraphs: [
        "A versatile engineer can move between frontend polish and backend reliability without losing quality.",
        "The word also fits tools: a versatile dashboard template works for sales, support, and operations.",
      ],
    },
    {
      term: "Cohesive",
      meaning: "Forming a united whole; logically connected (often for teams or writing).",
      paragraphs: [
        "A cohesive essay repeats key terms with discipline so paragraphs feel like one argument.",
        "Cohesive teams argue in meetings but commit in writing once a decision is made.",
      ],
    },
    {
      term: "Inherent",
      meaning: "Existing as a natural and permanent part of something.",
      paragraphs: [
        "Latency is inherent in global networks, so UX must communicate wait states honestly.",
        "There is inherent uncertainty in forecasting; the goal is to quantify it, not deny it.",
      ],
    },
    {
      term: "Prevalent",
      meaning: "Widespread or common in a particular group or period.",
      paragraphs: [
        "Phishing is prevalent enough that security training is now a baseline expectation, not a perk.",
        "Use prevalent when you can point to a population or dataset, not just a vibe.",
      ],
    },
    {
      term: "Obsolete",
      meaning: "No longer used or useful because something newer replaced it.",
      paragraphs: [
        "Manual approvals are not always obsolete, but they become a bottleneck when traffic scales.",
        "Calling a competitor obsolete is strong language; use it only when evidence supports the claim.",
      ],
    },
  ] satisfies Term[],
} as const;

const RWA_PARAGRAPH = `Real-world assets (RWAs) are becoming fundamental to many on-chain strategies. The idea sounds simple, but the legal layer remains ambiguous in several jurisdictions. A cohesive narrative helps investors understand why tokenized bonds are not a ubiquitous product yet, though adoption is prevalent among experimental funds. The infrastructure must be versatile enough to handle redemption flows, while teams build substantial buffers for volatility. Resilience in operations is inherent when both TradFi and DeFi processes coexist; legacy systems can feel obsolete beside cutting-edge settlement experiments.`;

const ADVANCED_IN_PARAGRAPH = [
  "fundamental",
  "ambiguous",
  "cohesive",
  "ubiquitous",
  "prevalent",
  "versatile",
  "substantial",
  "Resilience",
  "inherent",
  "obsolete",
] as const;

const SYNONYM_ITEMS = [
  {
    id: "syn1",
    prompt:
      "Original: This is a common problem in remote teams. Rewrite using **ubiquitous** or **prevalent** instead of common.",
  },
  {
    id: "syn2",
    prompt:
      "Original: Common dashboards still help if the metrics are honest. Rewrite using **ubiquitous** or **prevalent**.",
  },
  {
    id: "syn3",
    prompt:
      "Original: The issue is common in early-stage tokenization pilots. Rewrite using **ubiquitous** or **prevalent**.",
  },
  {
    id: "syn4",
    prompt:
      "Original: A common mistake is to skip disclosures. Rewrite using **ubiquitous** or **prevalent**.",
  },
  {
    id: "syn5",
    prompt:
      "Original: Delays are common when custody changes hands. Rewrite using **ubiquitous** or **prevalent**.",
  },
] as const;

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

function synonymOk(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (/\bcommon\b/i.test(t)) return false;
  const has =
    /\bubiquitous\b/i.test(t) ||
    /\bprevalent\b/i.test(t) ||
    /\bubiquitously\b/i.test(t) ||
    /\bprevalence\b/i.test(t);
  return has;
}

type Stored = {
  synonymRewrites: Record<string, string>;
  spotted: Record<string, boolean>;
};

const KEY = "lesson-4";

export default function Lesson4Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const selected = useMemo(
    () => LESSON_4.terms.find((t) => t.term === selectedTerm) ?? null,
    [selectedTerm],
  );

  const [synonymRewrites, setSynonymRewrites] = useState<Record<string, string>>({});
  const [spotted, setSpotted] = useState<Record<string, boolean>>({});
  const [practiceHydrated, setPracticeHydrated] = useState(false);

  useEffect(() => {
    const p = loadPracticeJson<Partial<Stored>>(KEY);
    if (p) {
      if (p.synonymRewrites && typeof p.synonymRewrites === "object")
        setSynonymRewrites(p.synonymRewrites);
      if (p.spotted && typeof p.spotted === "object") setSpotted(p.spotted);
    }
    setPracticeHydrated(true);
  }, []);

  useEffect(() => {
    if (!practiceHydrated) return;
    savePracticeJson(KEY, { synonymRewrites, spotted });
  }, [practiceHydrated, synonymRewrites, spotted]);

  const synonymStatus = useMemo(() => {
    return SYNONYM_ITEMS.reduce<Record<string, "neutral" | "ok" | "bad">>((acc, it) => {
      const v = (synonymRewrites[it.id] ?? "").trim();
      if (!v) acc[it.id] = "neutral";
      else if (synonymOk(v)) acc[it.id] = "ok";
      else acc[it.id] = "bad";
      return acc;
    }, {});
  }, [synonymRewrites]);

  const spottedCount = useMemo(
    () => ADVANCED_IN_PARAGRAPH.filter((w) => spotted[w]).length,
    [spotted],
  );

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              {LESSON_4.title}
            </div>
            <div className="mt-1 text-sm text-neutral-600">{LESSON_4.subtitle}</div>
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
          <div className="mt-1 text-sm text-neutral-600">{LESSON_4.objective}</div>

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
                {LESSON_4.terms.map((t) => {
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
                        <div className="text-sm font-semibold text-neutral-900">{t.term}</div>
                        <Pill tone={active ? "ok" : "neutral"}>{active ? "Selected" : "Tap"}</Pill>
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
                      <p className="text-sm leading-relaxed text-neutral-800">{selected.paragraphs[1]}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    Tap any term on the left.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-200 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Synonym challenge</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Replace the idea of <span className="font-semibold">common</span> using{" "}
                  <span className="font-semibold">ubiquitous</span> or{" "}
                  <span className="font-semibold">prevalent</span> (or a clear morphological variant).
                  Your sentence must <span className="font-semibold">not</span> include the word{" "}
                  <span className="font-semibold">common</span>.
                </div>
                <div className="mt-4 grid gap-4">
                  {SYNONYM_ITEMS.map((it) => {
                    const v = synonymRewrites[it.id] ?? "";
                    const st = synonymStatus[it.id] ?? "neutral";
                    return (
                      <div key={it.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Pill tone={st}>
                            {st === "neutral" ? "Empty" : st === "ok" ? "Strong rewrite" : "Adjust"}
                          </Pill>
                        </div>
                        <p className="mt-2 text-sm text-neutral-800">{it.prompt}</p>
                        <textarea
                          value={v}
                          onChange={(e) =>
                            setSynonymRewrites((prev) => ({ ...prev, [it.id]: e.target.value }))
                          }
                          rows={3}
                          spellCheck
                          lang="en"
                          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                          placeholder="Your rewritten sentence…"
                        />
                        {v.trim().length >= 40 ? (
                          <GrammarHints text={v} onChangeText={(next) => setSynonymRewrites((p) => ({ ...p, [it.id]: next }))} />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Interactive reading</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Read the paragraph about RWAs. Mark each advanced lesson word you find in the text.
                </div>
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-800">
                  {RWA_PARAGRAPH}
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Checklist ({spottedCount}/{ADVANCED_IN_PARAGRAPH.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ADVANCED_IN_PARAGRAPH.map((w) => {
                    const on = !!spotted[w];
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSpotted((prev) => ({ ...prev, [w]: !prev[w] }))}
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition",
                          on
                            ? "bg-[color:var(--brand)]/15 text-[color:var(--brand)] ring-[color:var(--brand)]/30"
                            : "bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
