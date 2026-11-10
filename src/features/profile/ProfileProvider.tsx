import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SkySettings } from "@/domain/sky/day";
import { systemTimeZone } from "@/domain/time/civil";
import type { Profile } from "./schema";
import { clearProfile, loadProfile, saveProfile, STORAGE_KEY } from "./storage";
import { defaultProfile } from "./schema";

interface ProfileContextValue {
  profile: Profile;
  update: (patch: Partial<Profile> | ((p: Profile) => Partial<Profile>)) => void;
  replace: (p: Profile) => void;
  reset: () => void;
  /** Settings in the shape the domain layer needs. Memoised. */
  sky: SkySettings;
  persisted: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children, initial }: { children: ReactNode; initial?: Profile }) {
  const [profile, setProfile] = useState<Profile>(() => initial ?? loadProfile());
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    setPersisted(saveProfile(profile));
  }, [profile]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setProfile(loadProfile());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Follow device time-zone changes (travel) unless the user pinned a zone.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      setProfile((p) => (p.timeZoneFollowsDevice && p.timeZone !== systemTimeZone() ? { ...p, timeZone: systemTimeZone() } : p));
    };
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  // Theme.
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", profile.theme);
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim().split(/\s+/).join(",");
    if (meta && bg) meta.setAttribute("content", `rgb(${bg})`);
  }, [profile.theme]);

  const update = useCallback<ProfileContextValue["update"]>((patch) => {
    setProfile((p) => ({ ...p, ...(typeof patch === "function" ? patch(p) : patch) }));
  }, []);
  const replace = useCallback((p: Profile) => setProfile(p), []);
  const reset = useCallback(() => {
    clearProfile();
    setProfile(defaultProfile());
  }, []);

  const sky = useMemo<SkySettings>(
    () => ({
      timeZone: profile.timeZone,
      zodiac: profile.zodiac,
      location: profile.location ?? null,
      birthDate: profile.birth?.date ?? null,
      orbs: profile.orbs,
    }),
    [profile.timeZone, profile.zodiac, profile.location, profile.birth?.date, profile.orbs],
  );

  const value = useMemo(() => ({ profile, update, replace, reset, sky, persisted }), [profile, update, replace, reset, sky, persisted]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
