/**
 * Event searches over a time range: seasons, eclipses, lunar apsides,
 * planetary stations and longitude-boundary crossings.
 */
import {
  MakeTime,
  NextGlobalSolarEclipse,
  NextLunarApsis,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  SearchLunarApsis,
  SearchLunarEclipse,
  Seasons,
} from "astronomy-engine";
import { type BodyId, longitudeOf, longitudeSpeed } from "./bodies";
import { normalizeDegrees } from "./angles";

const DAY = 86_400_000;

export type SeasonKind = "marchEquinox" | "juneSolstice" | "septemberEquinox" | "decemberSolstice";
export type EclipseKind = "penumbral" | "partial" | "annular" | "total";

export interface SeasonEvent {
  kind: SeasonKind;
  instant: Date;
}

export function seasonsBetween(start: Date, end: Date): SeasonEvent[] {
  const out: SeasonEvent[] = [];
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    const s = Seasons(y);
    const list: [SeasonKind, Date][] = [
      ["marchEquinox", s.mar_equinox.date],
      ["juneSolstice", s.jun_solstice.date],
      ["septemberEquinox", s.sep_equinox.date],
      ["decemberSolstice", s.dec_solstice.date],
    ];
    for (const [kind, instant] of list) if (instant >= start && instant < end) out.push({ kind, instant });
  }
  return out;
}

export interface EclipseEvent {
  body: "Moon" | "Sun";
  kind: EclipseKind;
  /** Instant of greatest eclipse. */
  instant: Date;
  /** Lunar: fraction of the Moon's disk in the umbra (1 = total). Solar: obscuration at peak, if central. */
  obscuration?: number;
}

export function eclipsesBetween(start: Date, end: Date): EclipseEvent[] {
  const out: EclipseEvent[] = [];
  // Searches begin slightly earlier so an eclipse peaking at `start` is not skipped.
  const from = MakeTime(new Date(start.getTime() - DAY));
  for (let e = SearchLunarEclipse(from); e.peak.date < end; e = NextLunarEclipse(e.peak)) {
    if (e.peak.date >= start) out.push({ body: "Moon", kind: e.kind as EclipseKind, instant: e.peak.date, obscuration: e.obscuration });
  }
  for (let e = SearchGlobalSolarEclipse(from); e.peak.date < end; e = NextGlobalSolarEclipse(e.peak)) {
    if (e.peak.date >= start) out.push({ body: "Sun", kind: e.kind as EclipseKind, instant: e.peak.date, obscuration: e.obscuration });
  }
  return out.sort((a, b) => a.instant.getTime() - b.instant.getTime());
}

export interface ApsisEvent {
  kind: "perigee" | "apogee";
  instant: Date;
  distanceKm: number;
}

export function lunarApsidesBetween(start: Date, end: Date): ApsisEvent[] {
  const out: ApsisEvent[] = [];
  for (let a = SearchLunarApsis(MakeTime(start)); a.time.date < end; a = NextLunarApsis(a)) {
    out.push({ kind: a.kind === 0 ? "perigee" : "apogee", instant: a.time.date, distanceKm: a.dist_km });
  }
  return out;
}

function bisect(lo: number, hi: number, isAfter: (t: number) => boolean, toleranceMs = 30_000): number {
  while (hi - lo > toleranceMs) {
    const mid = (lo + hi) / 2;
    if (isAfter(mid)) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export interface StationEvent {
  body: BodyId;
  /** Direction the body turns *to* at this station. */
  turnsTo: "retrograde" | "direct";
  instant: Date;
  longitude: number;
}

/** Stationary points: where apparent motion in longitude changes sign. */
export function stationsBetween(body: BodyId, start: Date, end: Date): StationEvent[] {
  if (body === "Sun" || body === "Moon") return [];
  const out: StationEvent[] = [];
  let t0 = start.getTime();
  let s0 = longitudeSpeed(body, new Date(t0));
  for (let t1 = t0 + DAY; t0 < end.getTime(); t1 += DAY) {
    const s1 = longitudeSpeed(body, new Date(t1));
    if (Math.sign(s1) !== Math.sign(s0) && s0 !== 0) {
      const wasPositive = s0 > 0;
      const tm = bisect(t0, t1, (t) => longitudeSpeed(body, new Date(t)) > 0 !== wasPositive);
      if (tm < end.getTime() && tm >= start.getTime()) {
        const instant = new Date(tm);
        out.push({ body, turnsTo: wasPositive ? "retrograde" : "direct", instant, longitude: longitudeOf(body, instant) });
      }
    }
    t0 = t1;
    s0 = s1;
  }
  return out;
}

export interface BoundaryCrossing {
  body: BodyId;
  instant: Date;
  /** Index of the 30° segment entered (0–11), after subtracting `offset`. */
  segment: number;
  /** Whether the crossing happened while moving backwards. */
  retrograde: boolean;
}

/**
 * Crossings of 30° boundaries (`offset + 30k`) by a body's longitude.
 * With offset 0 these are tropical sign ingresses; with an ayanamsa, sidereal ones.
 */
export function boundaryCrossingsBetween(body: BodyId, start: Date, end: Date, offset = 0): BoundaryCrossing[] {
  const step = body === "Moon" ? DAY / 4 : DAY;
  const seg = (t: number) => Math.floor(normalizeDegrees(longitudeOf(body, new Date(t)) - offset) / 30);
  const out: BoundaryCrossing[] = [];
  let t0 = start.getTime();
  let g0 = seg(t0);
  while (t0 < end.getTime()) {
    const t1 = Math.min(t0 + step, end.getTime());
    const g1 = seg(t1);
    if (g1 !== g0) {
      const tm = bisect(t0, t1, (t) => seg(t) !== g0);
      const forward = (g1 - g0 + 12) % 12 === 1;
      out.push({ body, instant: new Date(tm), segment: g1, retrograde: !forward });
    }
    t0 = t1;
    g0 = g1;
  }
  return out;
}
