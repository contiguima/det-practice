const STORAGE_KEY = "det-user-profile-v1";

export type UserProfile = {
  displayName: string;
};

function emptyProfile(): UserProfile {
  return { displayName: "" };
}

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const data = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: typeof data.displayName === "string" ? data.displayName.trim() : "",
    };
  } catch {
    return emptyProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ displayName: profile.displayName.trim().slice(0, 40) }),
    );
  } catch {
    // ignore
  }
}

export function greetingName(profile: UserProfile): string {
  const name = profile.displayName.trim();
  return name || "there";
}
