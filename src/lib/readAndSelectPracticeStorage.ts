const PREFIX = "det:read-and-select:practice:";

export function practiceStorageKey(lessonSlug: string): string {
  return `${PREFIX}${lessonSlug}`;
}

export function loadPracticeJson<T>(lessonSlug: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(practiceStorageKey(lessonSlug));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function savePracticeJson<T>(lessonSlug: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(practiceStorageKey(lessonSlug), JSON.stringify(data));
  } catch {
    // ignore quota / private mode
  }
}
