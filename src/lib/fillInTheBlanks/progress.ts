import type { LearnUnit } from "./learnPath";

const STORAGE_KEY = "det-fill-in-the-blanks-progress-v1";

export type FitbLearnProgress = {
  version: 1;
  completedUnitIds: string[];
};

function emptyProgress(): FitbLearnProgress {
  return { version: 1, completedUnitIds: [] };
}

export function loadFitbProgress(): FitbLearnProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<FitbLearnProgress>;
    if (data.version !== 1 || !Array.isArray(data.completedUnitIds)) return emptyProgress();
    return { version: 1, completedUnitIds: data.completedUnitIds };
  } catch {
    return emptyProgress();
  }
}

export function saveFitbProgress(progress: FitbLearnProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function markUnitComplete(
  progress: FitbLearnProgress,
  unitId: string,
): FitbLearnProgress {
  if (progress.completedUnitIds.includes(unitId)) return progress;
  const next: FitbLearnProgress = {
    version: 1,
    completedUnitIds: [...progress.completedUnitIds, unitId],
  };
  saveFitbProgress(next);
  return next;
}

export function getCurrentUnitIndex(path: LearnUnit[], progress: FitbLearnProgress): number {
  for (let i = 0; i < path.length; i++) {
    const id = path[i].exercise.id;
    if (!progress.completedUnitIds.includes(id)) return i;
  }
  return path.length;
}
