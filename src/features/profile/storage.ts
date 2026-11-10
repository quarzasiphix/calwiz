/**
 * Profile persistence, migration, export/import and deletion.
 *
 * Storage key is versioned. Legacy keys from the original Calwiz
 * (`calwiz_birthdate` "DD/MM/YYYY", `calwiz_life_path_number`) are migrated
 * once and then removed. The stored life-path number is discarded: it is
 * recomputed from the birth date by the canonical engine.
 */
import { isCivilDate, systemTimeZone, toCivil, type CivilDate } from "@/domain/time/civil";
import { defaultProfile, profileSchema, type Profile } from "./schema";

export const STORAGE_KEY = "calwiz:profile:v1";
const LEGACY_BIRTHDATE = "calwiz_birthdate";
const LEGACY_LIFE_PATH = "calwiz_life_path_number";

function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.getItem("__probe__");
    return s;
  } catch {
    return null;
  }
}

/** Parse the legacy "DD/MM/YYYY" format. Returns null if not a real date. */
export function parseLegacyBirthdate(raw: string): CivilDate | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (!m) return null;
  const civil = toCivil({ day: Number(m[1]), month: Number(m[2]), year: Number(m[3]) });
  return isCivilDate(civil) ? civil : null;
}

/** Accepts unknown data and returns a valid profile, filling defaults for missing or invalid fields. */
export function coerceProfile(data: unknown): Profile {
  const base = defaultProfile();
  if (!data || typeof data !== "object") return base;
  const merged = { ...base, ...(data as object), version: base.version };
  const parsed = profileSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  // Field-by-field salvage: keep every field that validates on its own.
  const out: Record<string, unknown> = { ...base };
  const shape = profileSchema.shape;
  for (const key of Object.keys(shape) as (keyof typeof shape)[]) {
    const r = shape[key].safeParse((merged as Record<string, unknown>)[key]);
    if (r.success && r.data !== undefined) out[key] = r.data;
  }
  return profileSchema.parse(out);
}

export function loadProfile(): Profile {
  const s = safeStorage();
  if (!s) return defaultProfile();
  const raw = s.getItem(STORAGE_KEY);
  let profile: Profile;
  if (raw) {
    try {
      profile = coerceProfile(JSON.parse(raw));
    } catch {
      profile = defaultProfile();
    }
  } else {
    profile = defaultProfile();
    const legacy = s.getItem(LEGACY_BIRTHDATE);
    const date = legacy ? parseLegacyBirthdate(legacy) : null;
    if (date) {
      profile = { ...profile, birth: { date }, onboarded: true };
      saveProfile(profile);
    }
    s.removeItem(LEGACY_BIRTHDATE);
    s.removeItem(LEGACY_LIFE_PATH);
  }
  if (profile.timeZoneFollowsDevice) profile = { ...profile, timeZone: systemTimeZone() };
  return profile;
}

export function saveProfile(p: Profile): boolean {
  const s = safeStorage();
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile(): void {
  const s = safeStorage();
  s?.removeItem(STORAGE_KEY);
  s?.removeItem(LEGACY_BIRTHDATE);
  s?.removeItem(LEGACY_LIFE_PATH);
}

export function exportProfile(p: Profile): string {
  return JSON.stringify({ app: "calwiz", exportedAt: new Date().toISOString(), profile: p }, null, 2);
}

export function importProfile(json: string): Profile {
  const data = JSON.parse(json) as unknown;
  const inner = data && typeof data === "object" && "profile" in data ? (data as { profile: unknown }).profile : data;
  const parsed = profileSchema.safeParse({ ...defaultProfile(), ...(inner as object) });
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return parsed.data;
}
