"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Drill = { id: string; situation: string; expected: string };

const FREQUENCY_WORDS: Array<{
  word: string;
  meaning: string;
  why: string;
  example: string;
}> = [
  {
    word: "Actually",
    meaning: "In fact / in reality",
    why: "It does NOT mean “currently”. Use it to correct or add information.",
    example: "Actually, I meant Tuesday, not Thursday.",
  },
  {
    word: "Maybe",
    meaning: "Perhaps",
    why: "It gives you time to think and sounds softer.",
    example: "Maybe we can start at 3 instead of 2.",
  },
  {
    word: "Enough",
    meaning: "Sufficient",
    why: "Essential to ask for things or say something is okay now.",
    example: "That’s enough, thank you.",
  },
  {
    word: "Available",
    meaning: "Free / able to do something",
    why: "Useful for work, appointments, and products.",
    example: "I’m not available at 5, but I’m free at 6.",
  },
  {
    word: "Instead",
    meaning: "In place of",
    why: "Helps you offer alternatives when something is not possible.",
    example: "Can we meet tomorrow instead?",
  },
  {
    word: "Anyway",
    meaning: "In any case / to change topic",
    why: "Great to close an idea or change the topic naturally.",
    example: "Anyway, let’s move on to the next task.",
  },
];

const WILDCARD_VERBS: Array<{
  verb: string;
  meaning: string;
  examples: string[];
}> = [
  {
    verb: "GET",
    meaning:
      "A multi-use verb: get = receive / buy / arrive / understand (depends on context).",
    examples: ["I get it.", "I get a coffee.", "What time did you get home?"],
  },
  {
    verb: "WANT",
    meaning: "To express a desire or preference.",
    examples: ["I want this one.", "Do you want to sit here?"],
  },
  {
    verb: "NEED",
    meaning: "Stronger than want. To express necessity.",
    examples: ["I need help.", "We need more time."],
  },
];

const DRILL_TERMS = [
  "Actually",
  "Maybe",
  "Enough",
  "Available",
  "Instead",
  "Anyway",
  "get",
  "want",
  "need",
] as const;

const LESSON_0_MATCHING = [
  {
    id: "m1",
    prompt: "Perhaps; a softer way to say it (one word): ____",
    answer: "Maybe",
  },
  {
    id: "m2",
    prompt: "In fact; used to correct or add information (one word): ____",
    answer: "Actually",
  },
  {
    id: "m3",
    prompt: "Sufficient; as much as needed (one word): ____",
    answer: "Enough",
  },
  {
    id: "m4",
    prompt: "Free or able to meet / use something (one word): ____",
    answer: "Available",
  },
  {
    id: "m5",
    prompt: "In place of; as an alternative (one word): ____",
    answer: "Instead",
  },
  {
    id: "m6",
    prompt: "In any case; to close an idea or change topic (one word): ____",
    answer: "Anyway",
  },
  {
    id: "m7",
    prompt: "Fill the gap: “I’m not sure yet — ____ we can ask at reception.”",
    answer: "Maybe",
  },
  {
    id: "m8",
    prompt: "Fill the gap: “____, I meant Tuesday, not Thursday.”",
    answer: "Actually",
  },
  {
    id: "m9",
    prompt: "Fill the gap: “That’s ____, thank you.”",
    answer: "Enough",
  },
  {
    id: "m10",
    prompt: "Fill the gap: “Sorry, I’m not ____ until 4 PM.”",
    answer: "Available",
  },
  {
    id: "m11",
    prompt: "Fill the gap: “Could I have tea ____ of coffee?”",
    answer: "Instead",
  },
  {
    id: "m12",
    prompt: "Fill the gap: “____, let’s talk about the budget tomorrow.”",
    answer: "Anyway",
  },
  {
    id: "m13",
    prompt: "Fill the gap: “Is this seat ____?” (free to use)",
    answer: "Available",
  },
  {
    id: "m14",
    prompt: "To express necessity (verb): ____",
    answer: "need",
  },
  {
    id: "m15",
    prompt: "To express desire or preference (verb): ____",
    answer: "want",
  },
  {
    id: "m16",
    prompt: "A multi-use verb for understand / receive / arrive (verb): ____",
    answer: "get",
  },
  {
    id: "m17",
    prompt: "Fill the gap: “I don’t ____ the instructions yet.”",
    answer: "get",
  },
  {
    id: "m18",
    prompt: "Fill the gap: “Do you ____ to sit by the window?”",
    answer: "want",
  },
  {
    id: "m19",
    prompt: "Fill the gap: “We ____ more time before we decide.”",
    answer: "need",
  },
  {
    id: "m20",
    prompt: "Fill the gap: “Thanks — I ____ it now.” (I understand)",
    answer: "get",
  },
  {
    id: "m21",
    prompt: "Fill the gap: “I ____ a coffee, please.”",
    answer: "want",
  },
  {
    id: "m22",
    prompt: "Fill the gap: “You don’t ____ to answer today.”",
    answer: "need",
  },
  {
    id: "m23",
    prompt: "Stronger than want; must-have feeling (verb): ____",
    answer: "need",
  },
  {
    id: "m24",
    prompt: "Fill the gap: “____ of waiting, let’s walk.”",
    answer: "Instead",
  },
  {
    id: "m25",
    prompt: "Fill the gap: “I have ____ sugar in my tea, thanks.”",
    answer: "Enough",
  },
];

const SITUATION_DRILLS: Drill[] = [
  {
    id: "s1",
    situation:
      "Situation A: You are in a café, but they don’t have almond milk. You want regular milk instead.",
    expected: "Can I have regular milk instead?",
  },
  {
    id: "s2",
    situation:
      "Situation B: Someone explains something difficult and you finally understand it.",
    expected: "I get it now, thanks!",
  },
  {
    id: "s3",
    situation:
      "Situation C: Someone asks if you can have a meeting today at 5 PM.",
    expected: "I am not available at 5, maybe tomorrow?",
  },
  {
    id: "s4",
    situation:
      "Situation D: A friend offers more food, but you are full and want to stop politely.",
    expected: "That's enough, thank you.",
  },
  {
    id: "s5",
    situation:
      "Situation E: You thought the deadline was Friday, but it is Thursday. Correct yourself in one short sentence.",
    expected: "Actually, the deadline is Thursday.",
  },
  {
    id: "s6",
    situation:
      "Situation F: The topic is getting long. You want to change subject politely.",
    expected: "Anyway, let's talk about something else.",
  },
  {
    id: "s7",
    situation:
      "Situation G: You politely ask for water at a restaurant (use “I would like”).",
    expected: "I would like a glass of water, please.",
  },
  {
    id: "s8",
    situation:
      "Situation H: You are not free at 2 PM, but you are free at 4 PM. Offer 4 PM in one sentence.",
    expected: "I'm not available at 2, but I'm available at 4.",
  },
];

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[“”]/g, "\"")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

function matches(input: string, expected: string) {
  const a = normalize(input).replace(/[.]/g, "");
  const b = normalize(expected).replace(/[.]/g, "");
  return a === b;
}

function normalizeAnswer(s: string) {
  return s.trim().toLowerCase();
}

function answersMatch(input: string, expected: string) {
  return normalizeAnswer(input) === normalizeAnswer(expected);
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
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

const DRILL_TERMS_LIST = [...DRILL_TERMS];

export default function Lesson0Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [situationAnswers, setSituationAnswers] = useState<Record<string, string>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [drill, setDrill] = useState("");

  const situationStatus = useMemo(() => {
    return SITUATION_DRILLS.reduce<Record<string, "neutral" | "ok" | "bad">>((acc, d) => {
      const v = (situationAnswers[d.id] ?? "").trim();
      acc[d.id] = v.length === 0 ? "neutral" : matches(v, d.expected) ? "ok" : "bad";
      return acc;
    }, {});
  }, [situationAnswers]);

  const drillFeedback = useMemo(() => {
    const sentences = splitSentences(drill);
    const used = DRILL_TERMS_LIST.filter((term) =>
      new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        drill,
      ),
    );

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
              Lesson 0 · The Skeleton of English
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Foundations: connect objects, actions, and wants.
            </div>
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
            Stop relying on gestures and start connecting objects, actions, and desires
            in simple English.
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
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">
                  1) “Invisible” high-frequency words
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  Words you use all the time, but beginners often forget.
                </div>

                <div className="mt-4 grid gap-3">
                  {FREQUENCY_WORDS.map((w) => (
                    <div
                      key={w.word}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-neutral-900">
                          {w.word}
                        </div>
                        <Pill tone="neutral">{w.meaning}</Pill>
                      </div>
                      <div className="mt-2 text-sm text-neutral-700">{w.why}</div>
                      <div className="mt-2 text-sm text-neutral-700">
                        <span className="font-semibold text-neutral-900">Example:</span>{" "}
                        {w.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="text-sm font-semibold text-neutral-900">
                    2) The “wildcard verbs”
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Instead of learning 100 verbs, start with these 3.
                  </div>

                  <div className="mt-4 grid gap-3">
                    {WILDCARD_VERBS.map((v) => (
                      <div
                        key={v.verb}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                      >
                        <div className="text-sm font-semibold text-neutral-900">
                          {v.verb}
                        </div>
                        <div className="mt-1 text-sm text-neutral-700">
                          {v.meaning}
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          <span className="font-semibold text-neutral-900">
                            Examples:
                          </span>{" "}
                          {v.examples.join(" / ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="text-sm font-semibold text-neutral-900">
                    3) Bonus (sound more professional)
                  </div>
                  <div className="mt-2 text-sm text-neutral-700">
                    Use <span className="font-semibold">“I would like”</span>{" "}
                    instead of <span className="font-semibold">“I want”</span>.
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
                      I want coffee.{" "}
                      <span className="text-neutral-500">(can sound rude)</span>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
                      I would like a coffee.{" "}
                      <span className="text-neutral-500">(polite, B1-friendly)</span>
                    </div>
                  </div>
                </div>
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
                    Type the missing word
                  </div>
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  Frequency words and the three wildcard verbs from the lesson.
                </div>

                <div className="mt-4 grid max-h-[min(70vh,720px)] gap-3 overflow-y-auto pr-1">
                  {LESSON_0_MATCHING.map((m) => {
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
                            Type the missing word
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
                  Write{" "}
                  <span className="font-semibold text-neutral-900">3 sentences</span>{" "}
                  about a simple day (café, work, friends) using words from this
                  lesson.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {DRILL_TERMS_LIST.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <textarea
                  value={drill}
                  onChange={(e) => setDrill(e.target.value)}
                  rows={7}
                  className="mt-4 w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                  placeholder="Example: Maybe I'm not available at 5, but I need to leave anyway..."
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
                      <span>Use at least 3 lesson words</span>
                      <span className="font-semibold text-neutral-900">
                        {drillFeedback.used.length}/3
                      </span>
                    </div>
                    {drillFeedback.used.length > 0 ? (
                      <div className="text-xs text-neutral-600">
                        Detected: {drillFeedback.used.join(", ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-neutral-900">
                  Full sentences
                </div>
                <div className="text-[11px] font-semibold text-neutral-500">
                  Type the full sentence (compare with target)
                </div>
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Short situations — same style as before, with more items.
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {SITUATION_DRILLS.map((d) => {
                  const v = situationAnswers[d.id] ?? "";
                  const status = situationStatus[d.id] ?? "neutral";
                  return (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-neutral-800">{d.situation}</div>
                        <Pill tone={status}>
                          {status === "neutral"
                            ? "Type your answer"
                            : status === "ok"
                              ? "Correct"
                              : "Incorrect"}
                        </Pill>
                      </div>

                      <input
                        type="text"
                        value={v}
                        onChange={(e) =>
                          setSituationAnswers((prev) => ({
                            ...prev,
                            [d.id]: e.target.value,
                          }))
                        }
                        placeholder="Type the sentence…"
                        className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                      />

                      <div className="mt-3 text-sm text-neutral-700">
                        <span className="font-semibold text-neutral-900">Target:</span>{" "}
                        {d.expected}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
