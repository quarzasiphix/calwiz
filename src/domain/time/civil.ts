/**
 * Civil (calendar) dates and time-zone conversion.
 *
 * Calwiz distinguishes two kinds of time value — keep them apart:
 *
 *  - `CivilDate` ("2026-11-10"): a calendar day as a person names it in some
 *    time zone. Numerology and the calendar grid work with civil dates.
 *  - `Date` / instant: an absolute moment (UTC). Astronomy works with instants.
 *
 * Converting between them always requires an IANA time zone. All conversions
 * live here so no screen invents its own (DST-unsafe) arithmetic.
 */

export type CivilDate = `${number}-${string}-${string}`;

export interface CivilParts {
  year: number;
  month: number; // 1–12
  day: number; // 1–31
}

const CIVIL_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isCivilDate(value: string): value is CivilDate {
  const m = CIVIL_RE.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

export function parseCivil(value: CivilDate | string): CivilParts {
  const m = CIVIL_RE.exec(value);
  if (!m) throw new RangeError(`Invalid civil date: ${value}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export function toCivil({ year, month, day }: CivilParts): CivilDate {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` as CivilDate;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Add whole days to a civil date (pure calendar arithmetic, no time zone involved). */
export function addDays(date: CivilDate, days: number): CivilDate {
  const { year, month, day } = parseCivil(date);
  const t = new Date(Date.UTC(year, month - 1, day + days));
  return toCivil({ year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() });
}

/** Add months, clamping the day (31 Jan + 1 month → 28/29 Feb). */
export function addMonths(date: CivilDate, months: number): CivilDate {
  const { year, month, day } = parseCivil(date);
  const idx = year * 12 + (month - 1) + months;
  const y = Math.floor(idx / 12);
  const mo = idx - y * 12 + 1;
  return toCivil({ year: y, month: mo, day: Math.min(day, daysInMonth(y, mo)) });
}

export function compareCivil(a: CivilDate, b: CivilDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Days from a to b (b − a). */
export function diffDays(a: CivilDate, b: CivilDate): number {
  const pa = parseCivil(a);
  const pb = parseCivil(b);
  return Math.round((Date.UTC(pb.year, pb.month - 1, pb.day) - Date.UTC(pa.year, pa.month - 1, pa.day)) / 86_400_000);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(date: CivilDate): number {
  const { year, month, day } = parseCivil(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function startOfMonth(date: CivilDate): CivilDate {
  const p = parseCivil(date);
  return toCivil({ ...p, day: 1 });
}

/** Monday- or Sunday-based week start. */
export function startOfWeek(date: CivilDate, weekStartsOn: 0 | 1): CivilDate {
  const offset = (weekday(date) - weekStartsOn + 7) % 7;
  return addDays(date, -offset);
}

// ---------------------------------------------------------------------------
// Time zones
// ---------------------------------------------------------------------------

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = dtfCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    dtfCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(tz: string): boolean {
  try {
    partsFormatter(tz);
    return true;
  } catch {
    return false;
  }
}

export function systemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export interface ZonedParts extends CivilParts {
  hour: number;
  minute: number;
  second: number;
}

/** Wall-clock reading of an instant in a time zone. */
export function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = partsFormatter(timeZone).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** UTC offset (minutes, east positive) of a time zone at an instant. */
export function offsetMinutes(instant: Date, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((asUtc - truncated) / 60_000);
}

/**
 * Instant at which the wall clock in `timeZone` reads the given local time.
 *
 * DST handling: in a spring-forward gap (a time that never occurs) the result
 * is shifted forward by the gap, matching what a clock would show. In a
 * fall-back overlap the earlier of the two instants is returned.
 */
export function zonedToInstant(date: CivilDate, time: { hour: number; minute: number; second?: number }, timeZone: string): Date {
  const { year, month, day } = parseCivil(date);
  const wall = Date.UTC(year, month - 1, day, time.hour, time.minute, time.second ?? 0);
  // Two-pass fixed-point: guess the offset, correct with the offset at the guess.
  const o1 = offsetMinutes(new Date(wall), timeZone);
  let t = wall - o1 * 60_000;
  const o2 = offsetMinutes(new Date(t), timeZone);
  if (o2 !== o1) {
    t = wall - o2 * 60_000;
    // Gap (offset increased): read the wall time with the pre-transition offset, i.e. shift forward.
    const o3 = offsetMinutes(new Date(t), timeZone);
    if (o3 !== o2) t = wall - Math.min(o1, o2) * 60_000;
  } else {
    // Overlap check: an earlier instant might also map to this wall time.
    const earlier = t - 3_600_000;
    const pe = zonedParts(new Date(earlier), timeZone);
    if (Date.UTC(pe.year, pe.month - 1, pe.day, pe.hour, pe.minute, pe.second) === wall) t = earlier;
  }
  return new Date(t);
}

/** Civil date of an instant in a time zone. */
export function civilOf(instant: Date, timeZone: string): CivilDate {
  const p = zonedParts(instant, timeZone);
  return toCivil(p);
}

/** [start, end) instants bounding a civil day in a zone (23–25 h around DST). */
export function dayBounds(date: CivilDate, timeZone: string): { start: Date; end: Date } {
  return {
    start: zonedToInstant(date, { hour: 0, minute: 0 }, timeZone),
    end: zonedToInstant(addDays(date, 1), { hour: 0, minute: 0 }, timeZone),
  };
}

/**
 * The reference instant used to describe a whole civil day: local noon.
 * Continuous quantities (illumination, positions) shown "for a day" are
 * sampled here unless the day is today, where "now" is used.
 */
export function dayReferenceInstant(date: CivilDate, timeZone: string): Date {
  return zonedToInstant(date, { hour: 12, minute: 0 }, timeZone);
}

export function todayIn(timeZone: string, now: Date = new Date()): CivilDate {
  return civilOf(now, timeZone);
}
