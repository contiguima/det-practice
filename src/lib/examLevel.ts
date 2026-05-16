export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/**
 * Nivel según puntaje acumulado en Examen 1 (máx. referencia 170).
 * 0–40: A1–A2 · 41–125: B1–B2 · 126–170: C1
 */
export function computeCefrLevelFromPoints(
  earnedPoints: number,
  hasAttempts: boolean,
): CefrLevel | null {
  if (!hasAttempts) return null;
  const p = Math.max(0, earnedPoints);
  if (p >= 126) return "C1";
  if (p >= 81) return "B2";
  if (p >= 41) return "B1";
  if (p >= 20) return "A2";
  return "A1";
}

/** Efectividad global: % de puntos auto-calificados obtenidos. */
export function computeEffectivenessFromPoints(earned: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((earned / max) * 100);
}

/**
 * @deprecated Usar computeCefrLevelFromPoints cuando haya puntaje de examen.
 */
export function computeCefrLevel(
  effectivenessPercent: number,
  hasAttempts: boolean,
): CefrLevel | null {
  if (!hasAttempts) return null;
  const p = Math.max(0, Math.min(100, effectivenessPercent));
  if (p >= 92) return "C2";
  if (p >= 82) return "C1";
  if (p >= 68) return "B2";
  if (p >= 52) return "B1";
  if (p >= 35) return "A2";
  return "A1";
}

export function levelIndex(level: CefrLevel | null): number {
  if (!level) return -1;
  return CEFR_LEVELS.indexOf(level);
}

export function levelBandLabel(points: number): string {
  if (points >= 126) return "Rango C1 (126–170 pts)";
  if (points >= 41) return "Rango B1–B2 (41–125 pts)";
  return "Rango A1–A2 (0–40 pts)";
}
