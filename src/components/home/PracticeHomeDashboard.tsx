"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPracticeEffectiveness, type PracticeEffectiveness } from "@/lib/practiceEffectiveness";
import { loadUserProfile, saveUserProfile } from "@/lib/userProfile";

export function PracticeHomeDashboard() {
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [metrics, setMetrics] = useState<PracticeEffectiveness | null>(null);

  const refreshMetrics = useCallback(() => {
    setMetrics(loadPracticeEffectiveness());
  }, []);

  useEffect(() => {
    const profile = loadUserProfile();
    setName(profile.displayName);
    refreshMetrics();
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key.startsWith("det-home-practice-stats") ||
        e.key.startsWith("det-fill-in-the-blanks-stats") ||
        e.key.startsWith("det-user-profile")
      ) {
        if (e.key?.startsWith("det-user-profile") && e.newValue) {
          try {
            const p = JSON.parse(e.newValue) as { displayName?: string };
            setName(typeof p.displayName === "string" ? p.displayName : "");
          } catch {
            // ignore
          }
        }
        refreshMetrics();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshMetrics);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshMetrics);
    };
  }, [refreshMetrics]);

  const commitName = (value: string) => {
    const trimmed = value.trim().slice(0, 40);
    setName(trimmed);
    saveUserProfile({ displayName: trimmed });
  };

  return (
    <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
          Hola
        </span>
        <label className="sr-only" htmlFor="practice-user-name">
          Tu nombre
        </label>
        <input
          id="practice-user-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => commitName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitName((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="tu nombre"
          className="min-w-[8rem] max-w-[14rem] border-b-2 border-[color:var(--brand)]/40 bg-transparent text-xl font-semibold text-[color:var(--brand)] outline-none placeholder:text-neutral-400 placeholder:font-normal focus:border-[color:var(--brand)] sm:min-w-[10rem] sm:text-2xl"
          autoComplete="nickname"
          maxLength={40}
        />
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Efectividad
        </div>
        <div className="mt-1 flex flex-wrap items-end gap-3">
          <span className="text-4xl font-semibold tracking-tight text-[color:var(--brand)] sm:text-5xl">
            {hydrated && metrics ? `${metrics.percent}%` : "—"}
          </span>
          {hydrated && metrics?.hasData ? (
            <span className="pb-1 text-sm text-neutral-600">
              {metrics.totalCorrect}/{metrics.totalScored} aciertos en Practicar
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-neutral-600">
          {hydrated && metrics?.hasData
            ? "Incluye Read and Select (práctica rápida) y Fill in the Blanks. Se actualiza al volver a esta pantalla."
            : "Completá ejercicios puntuables en Reading para ver tu efectividad."}
        </p>
      </div>
    </section>
  );
}
