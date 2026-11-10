import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { isCivilDate, todayIn, type CivilDate } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";

/** Current time, re-rendering at each minute boundary while the page is visible. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      const delay = intervalMs - (Date.now() % intervalMs) + 50;
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, delay);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
        window.clearTimeout(timer);
        schedule();
      } else window.clearTimeout(timer);
    };
    schedule();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intervalMs]);
  return now;
}

export function useToday(): CivilDate {
  const { profile } = useProfile();
  const now = useNow();
  return todayIn(profile.timeZone, now);
}

/** The `?d=YYYY-MM-DD` date on Moon/Sky/Numbers pages; defaults to today. */
export function useDateParam(): [CivilDate, (d: CivilDate | null) => void, boolean] {
  const today = useToday();
  const [params, setParams] = useSearchParams();
  const raw = params.get("d");
  const date = raw && isCivilDate(raw) ? raw : today;
  const set = (d: CivilDate | null) => {
    const next = new URLSearchParams(params);
    if (!d || d === today) next.delete("d");
    else next.set("d", d);
    setParams(next, { replace: true });
  };
  return [date, set, date === today];
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return online;
}
