"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SavedWritingBlock } from "@/components/read-and-select/SavedWritingBlock";
import {
  countLesson6SummaryHits,
  countWords,
} from "@/lib/readAndSelectLesson6TermBank";
import { loadPracticeJson, savePracticeJson } from "@/lib/readAndSelectPracticeStorage";

const COLLOCATIONS = [
  {
    phrase: "Bear in mind",
    meaning: "Remember and consider something important (often a warning or constraint).",
    example: "Bear in mind that custody rules differ by jurisdiction before you promise a launch date.",
  },
  {
    phrase: "Draw a conclusion",
    meaning: "Decide what something means after reviewing evidence or arguments.",
    example: "We cannot draw a conclusion yet because the sample size is too small.",
  },
  {
    phrase: "Meet a deadline",
    meaning: "Finish work on time by the agreed date.",
    example: "If we want to meet a deadline next Friday, we must freeze scope today.",
  },
  {
    phrase: "Take into account",
    meaning: "Include a factor when you decide; do not ignore it.",
    example: "Take into account operational risk, not only marketing metrics.",
  },
  {
    phrase: "Undergo a change",
    meaning: "Experience a change (often significant or formal).",
    example: "The platform will undergo a change in pricing logic after the audit.",
  },
  {
    phrase: "High-stakes",
    meaning: "Involving serious risk or reward; important outcomes depend on the result.",
    example: "A high-stakes demo should be rehearsed with a backup laptop.",
  },
  {
    phrase: "Cutting-edge",
    meaning: "The most advanced point of a field; very new technology or research.",
    example: "Cutting-edge models are exciting, but compliance still prefers boring reliability.",
  },
] as const;

const GAP_FILLS = [
  {
    id: "gf1",
    prompt: "We need to ____ the deadline to ensure the client is satisfied.",
    hint: "meet",
    answer: "meet a deadline",
  },
  {
    id: "gf2",
    prompt: "Before you invest, ____ the counterparty risk and local regulations.",
    hint: "take into account",
    answer: "take into account",
  },
  {
    id: "gf3",
    prompt: "After reviewing the logs, we can ____ the outage was caused by a config drift.",
    hint: "draw",
    answer: "draw a conclusion",
  },
  {
    id: "gf4",
    prompt: "The payment stack will ____ when we migrate to the new ledger integration.",
    hint: "undergo",
    answer: "undergo a change",
  },
  {
    id: "gf5",
    prompt: "____ that testnet traffic does not predict mainnet behavior perfectly.",
    hint: "bear",
    answer: "bear in mind",
  },
  {
    id: "gf7",
    prompt: "We want a ____ research partner, not a vendor that only ships slide decks.",
    hint: "cutting-edge",
    answer: "cutting-edge",
  },
] as const;

function normalizeGap(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'");
}

function gapMatch(input: string, expected: string) {
  return normalizeGap(input) === normalizeGap(expected);
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

type Stored = {
  gapInputs: Record<string, string>;
  finalSummary: string;
  finalCollapsed: boolean;
};

const KEY = "lesson-6";

export default function Lesson6Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const selected = useMemo(
    () => COLLOCATIONS.find((c) => c.phrase === selectedPhrase) ?? null,
    [selectedPhrase],
  );

  const [gapInputs, setGapInputs] = useState<Record<string, string>>({});
  const [finalSummary, setFinalSummary] = useState("");
  const [finalCollapsed, setFinalCollapsed] = useState(false);
  const [practiceHydrated, setPracticeHydrated] = useState(false);

  useEffect(() => {
    const p = loadPracticeJson<Partial<Stored>>(KEY);
    if (p) {
      if (p.gapInputs && typeof p.gapInputs === "object") setGapInputs(p.gapInputs);
      if (typeof p.finalSummary === "string") setFinalSummary(p.finalSummary);
      if (typeof p.finalCollapsed === "boolean") {
        const has = typeof p.finalSummary === "string" && p.finalSummary.trim().length > 0;
        setFinalCollapsed(has && p.finalCollapsed);
      }
    }
    setPracticeHydrated(true);
  }, []);

  useEffect(() => {
    if (!practiceHydrated) return;
    savePracticeJson(KEY, {
      gapInputs,
      finalSummary,
      finalCollapsed,
    });
  }, [practiceHydrated, gapInputs, finalSummary, finalCollapsed]);

  const gapStatus = useMemo(() => {
    return GAP_FILLS.reduce<Record<string, "neutral" | "ok" | "bad">>((acc, row) => {
      const v = (gapInputs[row.id] ?? "").trim();
      if (!v) acc[row.id] = "neutral";
      else if (gapMatch(v, row.answer)) acc[row.id] = "ok";
      else acc[row.id] = "bad";
      return acc;
    }, {});
  }, [gapInputs]);

  const summaryHits = useMemo(() => countLesson6SummaryHits(finalSummary), [finalSummary]);
  const wordCount = useMemo(() => countWords(finalSummary), [finalSummary]);
  const summaryOkWords = wordCount >= 150;
  const summaryOkTerms = summaryHits.uniqueCount >= 8;

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Lesson 6 · Idiomatic Expressions & Collocations
            </div>
            <div className="mt-1 text-sm text-neutral-600">Natural word partnerships</div>
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
          <div className="mt-1 text-sm text-neutral-600">
            Learn how English words group naturally (collocations) so your writing and speaking sound native
            in interviews and essays.
          </div>

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
            <div className="grid gap-4 sm:grid-cols-2">
              {COLLOCATIONS.map((c) => {
                const active = selectedPhrase === c.phrase;
                return (
                  <button
                    key={c.phrase}
                    type="button"
                    onClick={() => setSelectedPhrase((v) => (v === c.phrase ? null : c.phrase))}
                    className={[
                      "rounded-2xl border border-neutral-200 bg-white p-4 text-left transition",
                      active ? "ring-2 ring-[color:var(--brand)]/30" : "hover:border-neutral-300",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-neutral-900">{c.phrase}</div>
                      <Pill tone={active ? "ok" : "neutral"}>{active ? "Selected" : "Tap"}</Pill>
                    </div>
                    <div className="mt-2 text-xs text-neutral-600">{c.meaning}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="text-sm font-semibold text-neutral-900">Example</div>
              <div className="mt-2 text-sm text-neutral-600">
                Select a collocation above to see one professional sentence you can imitate.
              </div>
              {selected ? (
                <p className="mt-4 text-sm leading-relaxed text-neutral-800">{selected.example}</p>
              ) : (
                <p className="mt-4 text-sm text-neutral-600">Tap any card.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-200 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Gap fill</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Type the full collocation phrase (hyphens and spacing matter).
                </div>
                <div className="mt-4 grid gap-4">
                  {GAP_FILLS.map((row) => {
                    const v = gapInputs[row.id] ?? "";
                    const st = gapStatus[row.id] ?? "neutral";
                    return (
                      <div key={row.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Pill tone={st}>
                            {st === "neutral" ? "Empty" : st === "ok" ? "Correct" : "Try again"}
                          </Pill>
                          <span className="text-[11px] text-neutral-500">Hint: {row.hint}</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-800">{row.prompt}</p>
                        <input
                          value={v}
                          onChange={(e) =>
                            setGapInputs((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Type the collocation…"
                          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Final challenge</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Write a summary of about <span className="font-semibold">150 words</span> describing your
                  professional goals. Use vocabulary from <span className="font-semibold">all six lessons</span>{" "}
                  (single words and multi-word phrases count). Aim for at least{" "}
                  <span className="font-semibold">8 different</span> hits from the combined bank.
                </div>
                <SavedWritingBlock
                  value={finalSummary}
                  onChange={setFinalSummary}
                  collapsed={finalCollapsed}
                  onCollapsedChange={setFinalCollapsed}
                  rows={12}
                  placeholder="Write in English. Mix precise terms, connectors, and collocations naturally…"
                />
                <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-neutral-900">Your check</div>
                    {finalSummary.trim().length > 0 ? (
                      <Pill tone={summaryOkWords && summaryOkTerms ? "ok" : "bad"}>
                        {summaryOkWords && summaryOkTerms ? "Strong effort" : "Keep building"}
                      </Pill>
                    ) : (
                      <Pill tone="neutral">Type to get feedback</Pill>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                    <div className="flex items-center justify-between gap-4">
                      <span>Word count (target 150+)</span>
                      <span className="font-semibold text-neutral-900">{wordCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Distinct lesson hits (target 8+)</span>
                      <span className="font-semibold text-neutral-900">{summaryHits.uniqueCount}</span>
                    </div>
                    {summaryHits.singles.length + summaryHits.phrases.length > 0 ? (
                      <div className="text-xs text-neutral-600">
                        Detected:{" "}
                        {[...summaryHits.singles, ...summaryHits.phrases].slice(0, 24).join(", ")}
                        {summaryHits.uniqueCount > 24 ? "…" : ""}
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
