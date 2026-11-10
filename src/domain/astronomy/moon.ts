/**
 * The Moon: illumination, phase, lunation progress, distance, orientation,
 * rise/set.
 *
 * Two quantities are routinely confused and are kept distinct here:
 *
 *  - **Illuminated fraction** (`illumination`, 0–1): the fraction of the
 *    Moon's disk that is sunlit as seen from Earth. 0.5 at the quarters.
 *  - **Cycle progress** (`cycleFraction`, 0–1): how far through the current
 *    lunation (new moon → new moon) we are, by elapsed time. 0.5 is roughly
 *    full moon, but the quarters are not at 0.25/0.75 exactly because the
 *    Moon's orbital speed varies.
 *
 * `elongation` is the Moon's ecliptic longitude minus the Sun's (0 new,
 * 90 first quarter, 180 full, 270 last quarter) — the quantity phases are
 * defined by.
 */
import {
  Body,
  EquatorFromVector,
  GeoVector,
  Illumination,
  KM_PER_AU,
  MakeTime,
  MoonPhase,
  NextMoonQuarter,
  Observer,
  SearchMoonPhase,
  SearchMoonQuarter,
  SearchRiseSet,
  SiderealTime,
} from "astronomy-engine";
import { DEG, normalizeDegrees } from "./angles";

export const MEAN_SYNODIC_MONTH = 29.530588853; // days

export type PrincipalPhase = "new" | "firstQuarter" | "full" | "lastQuarter";
export type PhaseKey = PrincipalPhase | "waxingCrescent" | "waxingGibbous" | "waningGibbous" | "waningCrescent";

export const PHASE_NAMES: Record<PhaseKey, string> = {
  new: "New Moon",
  waxingCrescent: "Waxing Crescent",
  firstQuarter: "First Quarter",
  waxingGibbous: "Waxing Gibbous",
  full: "Full Moon",
  waningGibbous: "Waning Gibbous",
  lastQuarter: "Last Quarter",
  waningCrescent: "Waning Crescent",
};

export const PRINCIPAL_ELONGATION: Record<PrincipalPhase, number> = { new: 0, firstQuarter: 90, full: 180, lastQuarter: 270 };
const QUARTER_INDEX: PrincipalPhase[] = ["new", "firstQuarter", "full", "lastQuarter"];

/**
 * A principal phase name is used while the elongation is within this many
 * degrees of the exact phase. The Moon gains ~12.2°/day on the Sun, so 6°
 * ≈ ±12 hours around the exact instant.
 */
export const PRINCIPAL_WINDOW_DEG = 6;

export function phaseKeyFromElongation(elongation: number): PhaseKey {
  const e = normalizeDegrees(elongation);
  const w = PRINCIPAL_WINDOW_DEG;
  if (e < w || e >= 360 - w) return "new";
  if (e < 90 - w) return "waxingCrescent";
  if (e < 90 + w) return "firstQuarter";
  if (e < 180 - w) return "waxingGibbous";
  if (e < 180 + w) return "full";
  if (e < 270 - w) return "waningGibbous";
  if (e < 270 + w) return "lastQuarter";
  return "waningCrescent";
}

export interface PhaseEvent {
  phase: PrincipalPhase;
  instant: Date;
}

export interface MoonState {
  instant: Date;
  /** Illuminated fraction of the disk, 0–1. */
  illumination: number;
  /** Moon − Sun ecliptic longitude, degrees [0, 360). */
  elongation: number;
  waxing: boolean;
  phase: PhaseKey;
  /** Days since the previous new moon. */
  ageDays: number;
  /** Length of the current lunation (previous → next new moon), days. */
  lunationDays: number;
  /** Elapsed fraction of the current lunation by time, 0–1. */
  cycleFraction: number;
  previousNew: Date;
  nextNew: Date;
  /** Next occurrence of each principal phase strictly after `instant`. */
  next: Record<PrincipalPhase, Date>;
  distanceKm: number;
  /** Apparent angular diameter, degrees. */
  diameterDeg: number;
  /**
   * Position angle of the bright limb's midpoint, degrees, measured from
   * celestial north towards east (Meeus 48.5). Used to orient the rendered disk.
   */
  brightLimbAngle: number;
}

const MOON_RADIUS_KM = 1737.4;

function searchPhase(targetLon: number, start: Date, limitDays: number): Date {
  const t = SearchMoonPhase(targetLon, MakeTime(start), limitDays);
  if (!t) throw new Error(`Moon phase ${targetLon}° not found within ${limitDays} d of ${start.toISOString()}`);
  return t.date;
}

export function previousNewMoon(instant: Date): Date {
  // Walk forward from 32 days earlier; at most two new moons lie in that window.
  let t = searchPhase(0, new Date(instant.getTime() - 32 * 86_400_000), 33);
  for (;;) {
    const next = searchPhase(0, new Date(t.getTime() + 1000), 32);
    if (next.getTime() > instant.getTime()) return t;
    t = next;
  }
}

export function nextPhaseAfter(phase: PrincipalPhase, instant: Date): Date {
  return searchPhase(PRINCIPAL_ELONGATION[phase], new Date(instant.getTime() + 1000), 32);
}

/** All principal phase events in [start, end). */
export function phaseEventsBetween(start: Date, end: Date): PhaseEvent[] {
  const out: PhaseEvent[] = [];
  let q = SearchMoonQuarter(MakeTime(start));
  while (q.time.date.getTime() < end.getTime()) {
    out.push({ phase: QUARTER_INDEX[q.quarter]!, instant: q.time.date });
    q = NextMoonQuarter(q);
  }
  return out;
}

/** Position angle of the Moon's bright limb (Meeus, Astronomical Algorithms, eq. 48.5). */
export function brightLimbAngle(instant: Date): number {
  const t = MakeTime(instant);
  const s = EquatorFromVector(GeoVector(Body.Sun, t, true));
  const m = EquatorFromVector(GeoVector(Body.Moon, t, true));
  const a0 = s.ra * 15 * DEG;
  const d0 = s.dec * DEG;
  const a = m.ra * 15 * DEG;
  const d = m.dec * DEG;
  const y = Math.cos(d0) * Math.sin(a0 - a);
  const x = Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(a0 - a);
  return normalizeDegrees(Math.atan2(y, x) / DEG);
}

/**
 * Parallactic angle of the Moon for an observer (degrees): the angle between
 * celestial north and the zenith direction at the Moon. Subtracting it from a
 * north-up position angle gives a zenith-up ("as seen in your sky") angle.
 */
export function parallacticAngle(instant: Date, latitude: number, longitude: number): number {
  const t = MakeTime(instant);
  const m = EquatorFromVector(GeoVector(Body.Moon, t, true));
  const lst = (SiderealTime(t) + longitude / 15) * 15; // degrees
  const H = (lst - m.ra * 15) * DEG;
  const phi = latitude * DEG;
  const dec = m.dec * DEG;
  return Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(dec) - Math.sin(dec) * Math.cos(H)) / DEG;
}

export function moonState(instant: Date): MoonState {
  const t = MakeTime(instant);
  const illum = Illumination(Body.Moon, t);
  const elongation = MoonPhase(t);
  const previousNew = previousNewMoon(instant);
  const nextNew = nextPhaseAfter("new", instant);
  const lunationDays = (nextNew.getTime() - previousNew.getTime()) / 86_400_000;
  const ageDays = (instant.getTime() - previousNew.getTime()) / 86_400_000;
  const distanceKm = GeoVector(Body.Moon, t, true).Length() * KM_PER_AU;

  return {
    instant,
    illumination: illum.phase_fraction,
    elongation,
    waxing: elongation < 180,
    phase: phaseKeyFromElongation(elongation),
    ageDays,
    lunationDays,
    cycleFraction: Math.min(1, Math.max(0, ageDays / lunationDays)),
    previousNew,
    nextNew,
    next: {
      new: nextNew,
      firstQuarter: nextPhaseAfter("firstQuarter", instant),
      full: nextPhaseAfter("full", instant),
      lastQuarter: nextPhaseAfter("lastQuarter", instant),
    },
    distanceKm,
    diameterDeg: (2 * Math.asin(MOON_RADIUS_KM / distanceKm)) / DEG,
    brightLimbAngle: brightLimbAngle(instant),
  };
}

/** Lightweight variant for calendar cells: no event searches. */
export function moonSnapshot(instant: Date): Pick<MoonState, "illumination" | "elongation" | "waxing" | "phase" | "brightLimbAngle"> {
  const t = MakeTime(instant);
  const elongation = MoonPhase(t);
  return {
    illumination: Illumination(Body.Moon, t).phase_fraction,
    elongation,
    waxing: elongation < 180,
    phase: phaseKeyFromElongation(elongation),
    brightLimbAngle: brightLimbAngle(instant),
  };
}

export interface RiseSet {
  rise: Date | null;
  set: Date | null;
}

/** Rise and set of a body within [start, end). Either may be null (the Moon skips a rise or set about once a month). */
export function riseSetBetween(body: "Moon" | "Sun", start: Date, end: Date, latitude: number, longitude: number): RiseSet {
  const observer = new Observer(latitude, longitude, 0);
  const days = (end.getTime() - start.getTime()) / 86_400_000;
  const b = body === "Moon" ? Body.Moon : Body.Sun;
  const find = (dir: 1 | -1) => {
    const r = SearchRiseSet(b, observer, dir, MakeTime(start), days);
    return r && r.date.getTime() < end.getTime() ? r.date : null;
  };
  return { rise: find(1), set: find(-1) };
}
