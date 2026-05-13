"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadPracticeJson, savePracticeJson } from "@/lib/readAndSelectPracticeStorage";

type Term = {
  term: string;
  meaning: string;
  paragraphs: [string, string];
};

const LESSON_3 = {
  title: "Lesson 3 · Technology & Innovation",
  subtitle: "The Product Builder",
  objective:
    "Vocabulary for digital product studios and emerging technology: how teams ship, learn, and scale software responsibly.",
  terms: [
    {
      term: "Disruptive",
      meaning: "Describes an innovation that changes markets or user expectations in a major way.",
      paragraphs: [
        "A disruptive release is not always loud; sometimes it is a cheaper workflow that quietly replaces an old habit. Product studios watch for where friction disappears overnight.",
        "In a pitch, calling an idea disruptive should mean you can point to what behavior changes, not just a new logo.",
      ],
    },
    {
      term: "User-centric",
      meaning: "Designed around real user needs, evidence, and feedback—not internal convenience.",
      paragraphs: [
        "A user-centric roadmap starts with interviews and usage data before engineers lock scope. It protects teams from building the wrong thing very efficiently.",
        "When trade-offs appear, a user-centric team asks which option reduces confusion at the moment of truth: signup, checkout, or onboarding.",
      ],
    },
    {
      term: "Prototype",
      meaning: "An early model used to test an idea, flow, or interface before full build-out.",
      paragraphs: [
        "We built a clickable prototype in a week so stakeholders could feel navigation, not just read bullet points. That saved a month of debate.",
        "A prototype can be ugly as long as it answers one question clearly: does this workflow make sense to a first-time user?",
      ],
    },
    {
      term: "Deployment",
      meaning: "The process of releasing software to users (servers, stores, or devices).",
      paragraphs: [
        "Deployment is not only a technical step; it is a communication moment. If support does not know what changed, users will feel the gap first.",
        "Many teams automate deployment so each merge becomes a small, reversible release instead of a quarterly event.",
      ],
    },
    {
      term: "Iteration",
      meaning: "A repeated cycle of build, measure, and learn to improve a product.",
      paragraphs: [
        "Iteration is how a studio turns uncertainty into progress: ship a slice, read metrics, adjust the next slice. Speed without learning is not iteration.",
        "Good iteration includes a definition of done that includes instrumentation, not only UI pixels.",
      ],
    },
    {
      term: "Interdependence",
      meaning: "A situation where parts rely on each other; changes in one area affect others.",
      paragraphs: [
        "In platform products, interdependence is obvious: billing, identity, and analytics all touch the same user session. A change in one module can break trust elsewhere.",
        "Documenting interdependence helps teams sequence work and avoid surprise regressions during refactors.",
      ],
    },
    {
      term: "Framework",
      meaning: "A structured set of ideas, rules, or tools used to organize work or thinking.",
      paragraphs: [
        "A lightweight framework for prioritization beats a perfect spreadsheet nobody opens. The goal is shared language, not bureaucracy.",
        "Engineers often adopt a testing framework to keep quality consistent as the codebase grows.",
      ],
    },
    {
      term: "Paradigm",
      meaning: "A typical model or pattern of how something is understood or done in a field.",
      paragraphs: [
        "The shift from licensed software to subscriptions was a paradigm change for enterprise sales. The conversation moved from ownership to outcomes.",
        "When a team challenges an old paradigm, expect resistance—even if the data supports the new approach.",
      ],
    },
    {
      term: "Automation",
      meaning: "Using machines or scripts to perform tasks with minimal human effort.",
      paragraphs: [
        "Automation is strongest for repetitive checks: linting, backups, and release smoke tests. It frees humans for judgment-heavy design decisions.",
        "Poorly scoped automation can hide problems until they explode; monitors and alerts still need owners.",
      ],
    },
    {
      term: "Optimization",
      meaning: "The process of improving performance, cost, or outcomes under constraints.",
      paragraphs: [
        "Optimization without a metric is guesswork. Teams pick latency, conversion, or cost, then measure before and after.",
        "Sometimes optimization means removing features that nobody uses, not adding more knobs.",
      ],
    },
  ] satisfies Term[],
  fillBlanks: [
    {
      id: "f1",
      prompt:
        "The new ____ of the app allowed us to test the user interface before the full ____.",
      hints: ["prototype", "deployment"],
      answers: ["prototype", "deployment"],
    },
    {
      id: "f2",
      prompt:
        "Our studio adopted a ____ workflow so each ____ ships learning, not just code.",
      hints: ["user-centric", "iteration"],
      answers: ["user-centric", "iteration"],
    },
    {
      id: "f3",
      prompt:
        "The CTO argued the upgrade could be ____ if we respect the ____ between billing and identity services.",
      hints: ["disruptive", "interdependence"],
      answers: ["disruptive", "interdependence"],
    },
    {
      id: "f4",
      prompt:
        "We chose a simple ____ for prioritization, then focused ____ on build and test pipelines.",
      hints: ["framework", "optimization"],
      answers: ["framework", "optimization"],
    },
    {
      id: "f5",
      prompt:
        "The product thesis challenged the old ____ while ____ reduced manual release work.",
      hints: ["paradigm", "automation"],
      answers: ["paradigm", "automation"],
    },
  ] as const,
} as const;

function normalizeAnswer(s: string) {
  return s.trim().toLowerCase();
}

function splitTwoAnswers(input: string): [string, string] {
  const parts = input.split(/[,;/|]/).map((p) => p.trim());
  if (parts.length >= 2) return [parts[0]!, parts[1]!];
  const words = input.trim().split(/\s+/);
  if (words.length >= 2) return [words[0]!, words.slice(1).join(" ")];
  return [input.trim(), ""];
}

function twoBlanksMatch(input: string, expected: readonly [string, string]) {
  const [a, b] = splitTwoAnswers(input);
  return normalizeAnswer(a) === normalizeAnswer(expected[0]) && normalizeAnswer(b) === normalizeAnswer(expected[1]);
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
  fillInputs: Record<string, string>;
  speakingDone: boolean;
};

const KEY = "lesson-3";

export default function Lesson3Page() {
  const [tab, setTab] = useState<"learn" | "practice">("learn");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const selected = useMemo(
    () => LESSON_3.terms.find((t) => t.term === selectedTerm) ?? null,
    [selectedTerm],
  );

  const [fillInputs, setFillInputs] = useState<Record<string, string>>({});
  const [speakingDone, setSpeakingDone] = useState(false);
  const [practiceHydrated, setPracticeHydrated] = useState(false);

  const [recState, setRecState] = useState<"idle" | "recording" | "stopped">("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const p = loadPracticeJson<Partial<Stored>>(KEY);
    if (p) {
      if (p.fillInputs && typeof p.fillInputs === "object") setFillInputs(p.fillInputs);
      if (typeof p.speakingDone === "boolean") setSpeakingDone(p.speakingDone);
    }
    setPracticeHydrated(true);
  }, []);

  useEffect(() => {
    if (!practiceHydrated) return;
    savePracticeJson(KEY, { fillInputs, speakingDone });
  }, [practiceHydrated, fillInputs, speakingDone]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [playbackUrl]);

  const fillStatus = useMemo(() => {
    return LESSON_3.fillBlanks.reduce<Record<string, "neutral" | "ok" | "bad">>((acc, row) => {
      const v = (fillInputs[row.id] ?? "").trim();
      if (!v) acc[row.id] = "neutral";
      else if (twoBlanksMatch(v, row.answers)) acc[row.id] = "ok";
      else acc[row.id] = "bad";
      return acc;
    }, {});
  }, [fillInputs]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Tu navegador no permite grabar audio aquí.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mime });
        setPlaybackUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setRecState("stopped");
      };
      mr.start(200);
      setRecSeconds(0);
      setRecState("recording");
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecSeconds((s) => {
          if (s >= 59) {
            mr.stop();
            if (timerRef.current) window.clearInterval(timerRef.current);
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("No se pudo acceder al micrófono.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }, []);

  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              {LESSON_3.title}
            </div>
            <div className="mt-1 text-sm text-neutral-600">{LESSON_3.subtitle}</div>
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
          <div className="mt-1 text-sm text-neutral-600">{LESSON_3.objective}</div>

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
                {LESSON_3.terms.map((t) => {
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
                <div className="text-sm font-semibold text-neutral-900">Fill the blanks</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Each line needs <span className="font-semibold">two words</span> from the lesson,
                  in order, separated by a comma (example:{" "}
                  <span className="font-mono text-xs">prototype, deployment</span>).
                </div>
                <div className="mt-4 grid gap-4">
                  {LESSON_3.fillBlanks.map((row) => {
                    const v = fillInputs[row.id] ?? "";
                    const st = fillStatus[row.id] ?? "neutral";
                    return (
                      <div key={row.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Pill tone={st}>
                            {st === "neutral" ? "Empty" : st === "ok" ? "Correct" : "Check order/spelling"}
                          </Pill>
                          <span className="text-[11px] text-neutral-500">
                            Hints: {row.hints.join(", ")}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-neutral-800">{row.prompt}</p>
                        <label className="sr-only" htmlFor={`fill-${row.id}`}>
                          Two words for {row.id}
                        </label>
                        <input
                          id={`fill-${row.id}`}
                          value={v}
                          onChange={(e) =>
                            setFillInputs((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          placeholder="word1, word2"
                          autoComplete="off"
                          spellCheck={false}
                          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Speaking practice</div>
                <div className="mt-2 text-sm text-neutral-600">
                  Record up to <span className="font-semibold">1 minute</span> in English. Explain why a
                  minimal, &quot;Tesla-style&quot; product approach (fewer controls, clear defaults, fast
                  iteration) can be efficient for a digital product studio. Audio stays in your browser;
                  it is not uploaded.
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-800">
                    {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:
                    {String(recSeconds % 60).padStart(2, "0")} / 01:00
                  </div>
                  {recState === "idle" || recState === "stopped" ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="rounded-xl bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                      {recState === "stopped" ? "Record again" : "Start recording"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                    >
                      Stop
                    </button>
                  )}
                </div>
                {playbackUrl ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-neutral-700">Playback</div>
                    <audio controls src={playbackUrl} className="mt-2 w-full" />
                  </div>
                ) : null}
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-800">
                    <input
                      type="checkbox"
                      checked={speakingDone}
                      onChange={(e) => setSpeakingDone(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300"
                    />
                    <span>
                      I completed the speaking task (recorded and listened back). This preference is
                      saved on this device.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
