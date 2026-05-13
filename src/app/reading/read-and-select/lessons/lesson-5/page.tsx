"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadPracticeJson, savePracticeJson } from "@/lib/readAndSelectPracticeStorage";

const CONNECTORS = [
  {
    term: "Furthermore",
    meaning: "Adds another point in the same direction (formal).",
    example: "Furthermore, the pilot must include fraud monitoring from day one.",
  },
  {
    term: "Notwithstanding",
    meaning: "Despite something; formal contrast (often before a noun phrase).",
    example: "Notwithstanding market noise, the thesis remained unchanged.",
  },
  {
    term: "Consequently",
    meaning: "As a result; shows a logical outcome.",
    example: "Costs rose; consequently, we delayed the second release.",
  },
  {
    term: "Paradoxically",
    meaning: "Introduces something that seems contradictory but may be true.",
    example: "Paradoxically, more automation increased the need for human review.",
  },
  {
    term: "Albeit",
    meaning: "Although; introduces a concession (often compact).",
    example: "The plan was approved, albeit with tighter limits.",
  },
  {
    term: "In light of",
    meaning: "Because of new information; used to justify a decision.",
    example: "In light of the audit, we paused token minting temporarily.",
  },
  {
    term: "Conversely",
    meaning: "Introduces an opposite or contrasting case.",
    example: "Retail users wanted speed; conversely, institutions wanted receipts.",
  },
  {
    term: "Hence",
    meaning: "For this reason; therefore (often tight logical step).",
    example: "The key leaked once; hence, rotation is mandatory now.",
  },
  {
    term: "Moreover",
    meaning: "Also; adds supporting detail (similar to furthermore).",
    example: "Moreover, the same rule applies to testnet promotions.",
  },
  {
    term: "Subsequently",
    meaning: "After that in time; sequences events.",
    example: "We shipped v1; subsequently, we hardened custody workflows.",
  },
] as const;

const CONNECTOR_OPTIONS = [...CONNECTORS.map((c) => c.term), "— choose —"] as const;

const TOKENIZATION_SENTENCES = [
  "Financial tokenization promises faster settlement and broader access to private markets.",
  "Furthermore, back-office teams must redesign controls for a digital, auditable workflow.",
  "Consequently, early adopters report clearer lineage when ownership changes hands.",
  "Notwithstanding recent volatility, issuers still emphasize transparent disclosures and investor education.",
  "Hence, institutions proceed with cautious pilots while policy frameworks mature.",
] as const;

const INITIAL_SHUFFLED_ORDER = [3, 0, 4, 1, 2] as const;

const GAP_EXPECTED: Record<string, string> = {
  g1: "Moreover",
  g2: "Consequently",
  g3: "Furthermore",
};

function GapSelect({
  id,
  value,
  onChange,
  tone,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  tone: "neutral" | "ok" | "bad";
}) {
  return (
    <span className="mx-0.5 inline-flex flex-wrap items-center gap-1 align-middle">
      <label className="sr-only" htmlFor={id}>
        Connector {id}
      </label>
      <select
        id={id}
        value={value || "— choose —"}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[min(100%,11rem)] rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
      >
        {CONNECTOR_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <Pill tone={tone}>{tone === "neutral" ? "—" : tone === "ok" ? "OK" : "Retry"}</Pill>
    </span>
  );
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
  sentenceOrder: number[];
  gapChoices: Record<string, string>;
};

const KEY = "lesson-5";

export default function Lesson5Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const selected = useMemo(
    () => CONNECTORS.find((c) => c.term === selectedConnector) ?? null,
    [selectedConnector],
  );

  const [sentenceOrder, setSentenceOrder] = useState<number[]>([...INITIAL_SHUFFLED_ORDER]);
  const [gapChoices, setGapChoices] = useState<Record<string, string>>({});
  const [practiceHydrated, setPracticeHydrated] = useState(false);

  useEffect(() => {
    const p = loadPracticeJson<Partial<Stored>>(KEY);
    if (p) {
      if (
        Array.isArray(p.sentenceOrder) &&
        p.sentenceOrder.length === TOKENIZATION_SENTENCES.length &&
        new Set(p.sentenceOrder).size === TOKENIZATION_SENTENCES.length
      ) {
        setSentenceOrder(p.sentenceOrder);
      }
      if (p.gapChoices && typeof p.gapChoices === "object") setGapChoices(p.gapChoices);
    }
    setPracticeHydrated(true);
  }, []);

  useEffect(() => {
    if (!practiceHydrated) return;
    savePracticeJson(KEY, { sentenceOrder, gapChoices });
  }, [practiceHydrated, sentenceOrder, gapChoices]);

  const orderCorrect = useMemo(() => {
    return sentenceOrder.every((id, i) => id === i);
  }, [sentenceOrder]);

  const gapStatus = useMemo(() => {
    return Object.keys(GAP_EXPECTED).reduce<Record<string, "neutral" | "ok" | "bad">>((acc, id) => {
      const v = (gapChoices[id] ?? "").trim();
      if (!v || v === "— choose —") acc[id] = "neutral";
      else if (v === GAP_EXPECTED[id]) acc[id] = "ok";
      else acc[id] = "bad";
      return acc;
    }, {});
  }, [gapChoices]);

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= sentenceOrder.length) return;
    setSentenceOrder((prev) => {
      const next = [...prev];
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });
  };

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Lesson 5 · Transition & Connection
            </div>
            <div className="mt-1 text-sm text-neutral-600">Logic & Flow</div>
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
            Logical connectors for Interactive Reading and Writing: signal contrast, cause, sequence,
            and qualification like a B2 writer.
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
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {CONNECTORS.map((c) => {
                  const active = selectedConnector === c.term;
                  return (
                    <button
                      key={c.term}
                      type="button"
                      onClick={() => setSelectedConnector((v) => (v === c.term ? null : c.term))}
                      className={[
                        "rounded-2xl border border-neutral-200 bg-white p-4 text-left transition",
                        active ? "ring-2 ring-[color:var(--brand)]/30" : "hover:border-neutral-300",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-neutral-900">{c.term}</div>
                        <Pill tone={active ? "ok" : "neutral"}>{active ? "Selected" : "Tap"}</Pill>
                      </div>
                      <div className="mt-2 text-xs text-neutral-600">{c.meaning}</div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Example in a sentence</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Tap a connector on the left to see a compact example you can imitate.
                </div>
                {selected ? (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand)]">
                      {selected.term}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-800">{selected.example}</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    Tap any connector on the left.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-200 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-neutral-900">Paragraph reconstruction</div>
                  <Pill tone={orderCorrect ? "ok" : "bad"}>
                    {orderCorrect ? "Logical order" : "Reorder"}
                  </Pill>
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  Put the sentences about financial tokenization in a coherent order using the arrows.
                </div>
                <div className="mt-4 grid gap-3">
                  {sentenceOrder.map((sentenceIndex, position) => (
                    <div
                      key={`${sentenceIndex}-${position}`}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="text-sm text-neutral-800">
                          <span className="mr-2 font-mono text-xs text-neutral-500">{position + 1}.</span>
                          {TOKENIZATION_SENTENCES[sentenceIndex]}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => move(position, -1)}
                            disabled={position === 0}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 disabled:opacity-40"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => move(position, 1)}
                            disabled={position === sentenceOrder.length - 1}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 disabled:opacity-40"
                          >
                            Down
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Connector gap fill</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Choose connectors so the paragraph reads logically. Options include decoys.
                </div>
                <div className="mt-4 text-sm leading-relaxed text-neutral-800">
                  <span>Financial tokenization is accelerating globally.</span>{" "}
                  <GapSelect
                    id="g1"
                    value={gapChoices.g1 ?? ""}
                    onChange={(v) => setGapChoices((prev) => ({ ...prev, g1: v }))}
                    tone={gapStatus.g1 ?? "neutral"}
                  />
                  <span>, compliance costs are rising alongside opportunity.</span>{" "}
                  <GapSelect
                    id="g2"
                    value={gapChoices.g2 ?? ""}
                    onChange={(v) => setGapChoices((prev) => ({ ...prev, g2: v }))}
                    tone={gapStatus.g2 ?? "neutral"}
                  />
                  <span>
                    , liquidity and transparency can improve investor confidence when disclosures are
                    consistent.
                  </span>{" "}
                  <GapSelect
                    id="g3"
                    value={gapChoices.g3 ?? ""}
                    onChange={(v) => setGapChoices((prev) => ({ ...prev, g3: v }))}
                    tone={gapStatus.g3 ?? "neutral"}
                  />
                  <span>
                    , regulators publish guidance that still includes open questions. Risk culture matters as
                    much as code.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
