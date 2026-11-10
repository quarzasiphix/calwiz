/**
 * Day composition — the single source for "what is this date" in Calwiz.
 *
 * Screens never call the astronomy/numerology modules piecemeal for a day;
 * they call `daySummary` (cheap, for calendar cells) or `dayDetail` (full).
 * That guarantees the calendar, Today, Moon and Sky screens agree.
 */
import { allPositions, type BodyId, type BodyPosition } from "../astronomy/bodies";
import { moonSnapshot, moonState, PHASE_NAMES, riseSetBetween, type MoonState, type PhaseKey, type PrincipalPhase, type RiseSet } from "../astronomy/moon";
import { aspectsFromPositions, DEFAULT_ORBS, type Aspect, type Orbs } from "../astrology/aspects";
import { placement, zodiacLongitude, type SignPlacement, type ZodiacSystem } from "../astrology/zodiac";
import { memo } from "../cache";
import { dayNumbers, type DayNumbers } from "../numerology/engine";
import { addMonths, civilOf, dayBounds, dayReferenceInstant, startOfMonth, weekday, zonedToInstant, type CivilDate } from "../time/civil";
import { skyEventsBetween, type SkyEvent } from "./events";

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SkySettings {
  timeZone: string;
  zodiac: ZodiacSystem;
  location: Place | null;
  birthDate: CivilDate | null;
  orbs?: Orbs;
}

/** Traditional weekday rulers (Sunday–Saturday). */
export const DAY_RULERS: BodyId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export interface DaySummary {
  date: CivilDate;
  /** Illuminated fraction at local noon. */
  illumination: number;
  waxing: boolean;
  elongation: number;
  brightLimbAngle: number;
  /** Phase name for the day: a principal phase if its exact instant falls within the day, else the noon phase. */
  phase: PhaseKey;
  phaseName: string;
  phaseEvent: { phase: PrincipalPhase; instant: Date } | null;
  events: SkyEvent[];
  numbers: DayNumbers;
  sun: SignPlacement;
  moon: SignPlacement;
}

function monthRangeKey(date: CivilDate, tz: string) {
  const first = startOfMonth(date);
  const start = zonedToInstant(first, { hour: 0, minute: 0 }, tz);
  const end = zonedToInstant(addMonths(first, 1), { hour: 0, minute: 0 }, tz);
  return { start, end };
}

/** All events of the civil month containing `date` (cached; shared by every day of that month). */
export function monthEvents(date: CivilDate, s: Pick<SkySettings, "timeZone" | "zodiac">): SkyEvent[] {
  const { start, end } = monthRangeKey(date, s.timeZone);
  return skyEventsBetween(start, end, { zodiac: s.zodiac, moonIngresses: true });
}

export function eventsOnDay(date: CivilDate, s: Pick<SkySettings, "timeZone" | "zodiac">): SkyEvent[] {
  const { start, end } = dayBounds(date, s.timeZone);
  return monthEvents(date, s).filter((e) => e.instant >= start && e.instant < end);
}

export function daySummary(date: CivilDate, s: SkySettings): DaySummary {
  return memo("daySummary", `${date}|${s.timeZone}|${s.zodiac}|${s.birthDate ?? ""}`, () => {
    const noon = dayReferenceInstant(date, s.timeZone);
    const m = moonSnapshot(noon);
    const events = eventsOnDay(date, s);
    const pe = events.find((e): e is Extract<SkyEvent, { kind: "moonPhase" }> => e.kind === "moonPhase") ?? null;
    const phase: PhaseKey = pe ? pe.phase : m.phase;
    const positions = allPositions(noon);
    const lon = (b: BodyId) => zodiacLongitude(positions.find((p) => p.body === b)!.longitude, s.zodiac, noon);
    return {
      date,
      illumination: m.illumination,
      waxing: m.waxing,
      elongation: m.elongation,
      brightLimbAngle: m.brightLimbAngle,
      phase,
      phaseName: PHASE_NAMES[phase],
      phaseEvent: pe ? { phase: pe.phase, instant: pe.instant } : null,
      events,
      numbers: dayNumbers(date, s.birthDate),
      sun: placement(lon("Sun")),
      moon: placement(lon("Moon")),
    };
  });
}

export interface PlacedPosition extends BodyPosition {
  zodiacLongitude: number;
  placement: SignPlacement;
}

export interface DayDetail extends DaySummary {
  /** Instant the continuous values describe: now (if the date is today) or local noon. */
  instant: Date;
  isNow: boolean;
  moonState: MoonState;
  positions: PlacedPosition[];
  aspects: Aspect[];
  dayRuler: BodyId;
  sunTimes: RiseSet | null;
  moonTimes: RiseSet | null;
}

/**
 * Full detail for a date. If `now` falls on that date (in the user's zone),
 * continuous values use `now`; otherwise local noon.
 */
export function dayDetail(date: CivilDate, s: SkySettings, now: Date = new Date()): DayDetail {
  const isNow = civilOf(now, s.timeZone) === date;
  // Round "now" to the minute so repeated renders share the cache.
  const instant = isNow ? new Date(Math.floor(now.getTime() / 60_000) * 60_000) : dayReferenceInstant(date, s.timeZone);
  const loc = s.location;
  return memo(
    "dayDetail",
    `${date}|${instant.getTime()}|${s.timeZone}|${s.zodiac}|${s.birthDate ?? ""}|${loc ? `${loc.latitude},${loc.longitude}` : ""}|${JSON.stringify(s.orbs ?? "")}`,
    () => {
      const summary = daySummary(date, s);
      const ms = moonState(instant);
      const positions: PlacedPosition[] = allPositions(instant).map((p) => {
        const zl = zodiacLongitude(p.longitude, s.zodiac, instant);
        return { ...p, zodiacLongitude: zl, placement: placement(zl) };
      });
      const { start, end } = dayBounds(date, s.timeZone);
      return {
        ...summary,
        // Continuous values at the chosen instant (summary is at noon).
        illumination: ms.illumination,
        waxing: ms.waxing,
        elongation: ms.elongation,
        brightLimbAngle: ms.brightLimbAngle,
        sun: positions[0]!.placement,
        moon: positions[1]!.placement,
        instant,
        isNow,
        moonState: ms,
        positions,
        aspects: aspectsFromPositions(
          positions.map((p) => ({ ...p, longitude: p.zodiacLongitude })),
          s.orbs ?? DEFAULT_ORBS,
        ),
        dayRuler: DAY_RULERS[weekday(date)]!,
        sunTimes: loc ? riseSetBetween("Sun", start, end, loc.latitude, loc.longitude) : null,
        moonTimes: loc ? riseSetBetween("Moon", start, end, loc.latitude, loc.longitude) : null,
      };
    },
  );
}
