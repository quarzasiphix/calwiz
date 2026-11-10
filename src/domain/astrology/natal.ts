/**
 * Natal chart geometry: Ascendant, Midheaven and houses.
 *
 * The Ascendant and houses depend on the exact birth instant and place; they
 * are only computed when both are known — never with a guessed time.
 *
 * House systems supported: Whole Sign and Equal (both fully determined by the
 * Ascendant). Quadrant systems such as Placidus are not implemented yet.
 *
 * Planet positions are geocentric (the astrological convention), not
 * topocentric; the Moon can differ by up to ~1° from what an observer sees.
 */
import { MakeTime, RotateVector, Rotation_ECT_EQD, SiderealTime, Vector } from "astronomy-engine";
import { DEG, normalizeDegrees } from "../astronomy/angles";
import { allPositions, type BodyId, type BodyPosition } from "../astronomy/bodies";
import { zodiacLongitude, type ZodiacSystem } from "./zodiac";

export type HouseSystem = "wholeSign" | "equal";
export const HOUSE_SYSTEM_LABEL: Record<HouseSystem, string> = { wholeSign: "Whole Sign", equal: "Equal" };

/** True obliquity of the ecliptic (degrees), taken from the engine's own precession–nutation model. */
export function trueObliquity(instant: Date): number {
  const t = MakeTime(instant);
  const pole = RotateVector(Rotation_ECT_EQD(t), new Vector(0, 0, 1, t));
  return Math.acos(Math.max(-1, Math.min(1, pole.z))) / DEG;
}

/** Local apparent sidereal time expressed in degrees (RAMC). */
export function ramc(instant: Date, longitude: number): number {
  return normalizeDegrees((SiderealTime(MakeTime(instant)) + longitude / 15) * 15);
}

export interface Angles {
  ascendant: number;
  midheaven: number;
  obliquity: number;
  ramc: number;
}

/** Tropical Ascendant and Midheaven longitudes. */
export function chartAngles(instant: Date, latitude: number, longitude: number): Angles {
  const eps = trueObliquity(instant) * DEG;
  const r = ramc(instant, longitude);
  const R = r * DEG;
  const phi = latitude * DEG;
  const midheaven = normalizeDegrees(Math.atan2(Math.sin(R), Math.cos(R) * Math.cos(eps)) / DEG);
  const ascendant = normalizeDegrees(Math.atan2(Math.cos(R), -(Math.sin(R) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG);
  return { ascendant, midheaven, obliquity: eps / DEG, ramc: r };
}

export function houseCusps(ascendant: number, system: HouseSystem): number[] {
  const start = system === "wholeSign" ? Math.floor(normalizeDegrees(ascendant) / 30) * 30 : normalizeDegrees(ascendant);
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees(start + i * 30));
}

/** 1-based house number containing a longitude. */
export function houseOf(longitude: number, cusps: number[]): number {
  const first = cusps[0]!;
  return (Math.floor(normalizeDegrees(longitude - first) / 30) % 12) + 1;
}

export interface NatalPoint extends BodyPosition {
  /** Longitude in the requested zodiac. */
  zodiacLongitude: number;
  house: number | null;
}

export interface NatalChart {
  instant: Date;
  zodiac: ZodiacSystem;
  houseSystem: HouseSystem;
  /** Present only when birth time and place are known. */
  angles: { ascendant: number; midheaven: number } | null;
  cusps: number[] | null;
  points: NatalPoint[];
  /** Bodies whose sign is uncertain because the birth time is unknown. */
  uncertainSigns: BodyId[];
}

export interface NatalInput {
  instant: Date;
  zodiac: ZodiacSystem;
  houseSystem: HouseSystem;
  /** Omit when birth time or place is unknown. */
  location?: { latitude: number; longitude: number };
  /** When the time is unknown: bounds of the birth day, to flag uncertain signs. */
  dayBounds?: { start: Date; end: Date };
}

export function natalChart(input: NatalInput): NatalChart {
  const { instant, zodiac, houseSystem, location } = input;
  const toZ = (lon: number) => zodiacLongitude(lon, zodiac, instant);

  let angles: NatalChart["angles"] = null;
  let cusps: number[] | null = null;
  if (location) {
    const a = chartAngles(instant, location.latitude, location.longitude);
    angles = { ascendant: toZ(a.ascendant), midheaven: toZ(a.midheaven) };
    cusps = houseCusps(angles.ascendant, houseSystem);
  }

  const points: NatalPoint[] = allPositions(instant).map((p) => {
    const zl = toZ(p.longitude);
    return { ...p, zodiacLongitude: zl, house: cusps ? houseOf(zl, cusps) : null };
  });

  const uncertainSigns: BodyId[] = [];
  if (input.dayBounds) {
    const a = allPositions(input.dayBounds.start);
    const b = allPositions(new Date(input.dayBounds.end.getTime() - 60_000));
    a.forEach((p, i) => {
      const q = b[i]!;
      if (Math.floor(toZ(p.longitude) / 30) !== Math.floor(toZ(q.longitude) / 30)) uncertainSigns.push(p.body);
    });
  }

  return { instant, zodiac, houseSystem, angles, cusps, points, uncertainSigns };
}
