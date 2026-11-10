/**
 * Presentation formatting. All instant → text conversions go through here so
 * every screen renders times in the user's chosen zone.
 */
import type { BodyId } from "@/domain/astronomy/bodies";
import { PHASE_NAMES } from "@/domain/astronomy/moon";
import { BODY_GLYPH } from "@/domain/astrology/meanings";
import { SIGN_GLYPHS } from "@/domain/astrology/zodiac";
import type { SkyEvent } from "@/domain/sky/events";
import { parseCivil, type CivilDate } from "@/domain/time/civil";

const locale = () => (typeof navigator !== "undefined" ? navigator.language : "en-US");

const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(key: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const k = `${key}|${opts.timeZone ?? ""}`;
  let f = cache.get(k);
  if (!f) {
    f = new Intl.DateTimeFormat(locale(), opts);
    cache.set(k, f);
  }
  return f;
}

/** Civil dates are formatted in UTC so no zone shifts them. */
function civilAsUtc(d: CivilDate): Date {
  const { year, month, day } = parseCivil(d);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export const formatCivil = {
  long: (d: CivilDate) => fmt("long", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(civilAsUtc(d)),
  medium: (d: CivilDate) => fmt("medium", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(civilAsUtc(d)),
  dayMonth: (d: CivilDate) => fmt("dayMonth", { timeZone: "UTC", day: "numeric", month: "long" }).format(civilAsUtc(d)),
  monthYear: (d: CivilDate) => fmt("monthYear", { timeZone: "UTC", month: "long", year: "numeric" }).format(civilAsUtc(d)),
  month: (d: CivilDate) => fmt("monthOnly", { timeZone: "UTC", month: "long" }).format(civilAsUtc(d)),
  weekdayShort: (d: CivilDate) => fmt("wd", { timeZone: "UTC", weekday: "short" }).format(civilAsUtc(d)),
  weekdayNarrow: (d: CivilDate) => fmt("wdn", { timeZone: "UTC", weekday: "narrow" }).format(civilAsUtc(d)),
};

export function formatTime(instant: Date, timeZone: string): string {
  return fmt("time", { timeZone, hour: "numeric", minute: "2-digit" }).format(instant);
}

export function formatDateTime(instant: Date, timeZone: string): string {
  return fmt("dt", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(instant);
}

export function formatZoneName(instant: Date, timeZone: string): string {
  const parts = fmt("zone", { timeZone, timeZoneName: "short" }).formatToParts(instant);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

const rtf = () => new Intl.RelativeTimeFormat(locale(), { numeric: "auto" });

/** "in 3 days", "in 5 hours", "2 hours ago". */
export function formatRelative(instant: Date, now: Date): string {
  const diff = instant.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const r = rtf();
  if (abs < 3_600_000) return r.format(Math.round(diff / 60_000), "minute");
  if (abs < 48 * 3_600_000) return r.format(Math.round(diff / 3_600_000), "hour");
  return r.format(Math.round(diff / 86_400_000), "day");
}

/** "12 d 4 h" countdown. */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60_000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

export function formatPercent(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString(locale())} km`;
}

export function bodyLabel(b: BodyId): string {
  return `${BODY_GLYPH[b]} ${b}`;
}

const SEASON_LABEL = {
  marchEquinox: "March equinox",
  juneSolstice: "June solstice",
  septemberEquinox: "September equinox",
  decemberSolstice: "December solstice",
} as const;

export interface EventText {
  title: string;
  detail: string;
  glyph: string;
  tone: "moon" | "sky" | "gold" | "rose" | "muted";
}

export function describeEvent(e: SkyEvent): EventText {
  switch (e.kind) {
    case "moonPhase":
      return {
        title: PHASE_NAMES[e.phase],
        detail: "Exact lunar phase",
        glyph: { new: "●", firstQuarter: "◐", full: "○", lastQuarter: "◑" }[e.phase],
        tone: "moon",
      };
    case "eclipse":
      return {
        title: `${e.eclipse[0]!.toUpperCase()}${e.eclipse.slice(1)} ${e.body === "Moon" ? "lunar" : "solar"} eclipse`,
        detail: e.body === "Moon" ? "Visible wherever the Moon is up at the time" : "Visible only along a limited path — check local circumstances",
        glyph: "◒",
        tone: "rose",
      };
    case "season":
      return { title: SEASON_LABEL[e.season], detail: e.season.includes("Equinox") ? "Day and night near equal" : "Sun at its furthest north or south", glyph: "☉", tone: "gold" };
    case "apsis":
      return {
        title: e.apsis === "perigee" ? "Moon at perigee" : "Moon at apogee",
        detail: `${e.apsis === "perigee" ? "Closest" : "Farthest"} this orbit · ${formatKm(e.distanceKm)}`,
        glyph: BODY_GLYPH.Moon,
        tone: "muted",
      };
    case "station":
      return {
        title: `${e.body} stations ${e.turnsTo}`,
        detail: e.turnsTo === "retrograde" ? "Apparent motion turns backwards" : "Apparent motion resumes forwards",
        glyph: BODY_GLYPH[e.body],
        tone: "sky",
      };
    case "ingress":
      return {
        title: `${e.body} enters ${e.sign}`,
        detail: `${e.zodiac === "sidereal" ? "Sidereal" : "Tropical"} zodiac${e.retrograde ? " · retrograde" : ""}`,
        glyph: SIGN_GLYPHS[e.sign],
        tone: e.body === "Moon" ? "muted" : "sky",
      };
  }
}

export const TONE_CLASS: Record<EventText["tone"], string> = {
  moon: "text-moon",
  sky: "text-sky",
  gold: "text-gold",
  rose: "text-rose",
  muted: "text-muted",
};
