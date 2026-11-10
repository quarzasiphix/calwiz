/**
 * Geocentric apparent positions of the Sun, Moon and planets.
 *
 * Engine: astronomy-engine (Don Cross, MIT). VSOP87 for planets, a truncated
 * Chapront ELP for the Moon, Pluto from a numerical model. Stated accuracy is
 * about ±1 arcminute, far finer than anything Calwiz displays (0.1°).
 *
 * Convention: longitudes are on the **true ecliptic and equinox of date**,
 * geocentric, corrected for light-time and aberration ("apparent"). This is the
 * frame Western (tropical) astrology uses.
 */
import { Body, Ecliptic, GeoVector, KM_PER_AU, MakeTime } from "astronomy-engine";
import { normalizeDegrees, signedAngle } from "./angles";

export const BODY_IDS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;
export type BodyId = (typeof BODY_IDS)[number];

/** Bodies that can appear retrograde from Earth. */
export const PLANET_IDS = BODY_IDS.filter((b) => b !== "Sun" && b !== "Moon") as Exclude<BodyId, "Sun" | "Moon">[];

const ENGINE_BODY: Record<BodyId, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

export function engineBody(id: BodyId): Body {
  return ENGINE_BODY[id];
}

export interface BodyPosition {
  body: BodyId;
  /** Tropical ecliptic longitude, degrees [0, 360). */
  longitude: number;
  /** Ecliptic latitude, degrees. */
  latitude: number;
  distanceKm: number;
  /** Apparent motion in longitude, degrees per day (negative = retrograde). */
  speed: number;
  retrograde: boolean;
}

/** Apparent geocentric ecliptic longitude/latitude (of date). */
export function eclipticOf(body: BodyId, instant: Date): { longitude: number; latitude: number; distanceKm: number } {
  const t = MakeTime(instant);
  const v = GeoVector(ENGINE_BODY[body], t, true);
  const ecl = Ecliptic(v);
  return { longitude: normalizeDegrees(ecl.elon), latitude: ecl.elat, distanceKm: v.Length() * KM_PER_AU };
}

export function longitudeOf(body: BodyId, instant: Date): number {
  return eclipticOf(body, instant).longitude;
}

/** Central-difference rate of change of longitude, degrees/day. */
export function longitudeSpeed(body: BodyId, instant: Date): number {
  const h = body === "Moon" ? 1 / 24 : 0.5; // days
  const a = longitudeOf(body, new Date(instant.getTime() - h * 86_400_000));
  const b = longitudeOf(body, new Date(instant.getTime() + h * 86_400_000));
  return signedAngle(b - a) / (2 * h);
}

export function bodyPosition(body: BodyId, instant: Date): BodyPosition {
  const { longitude, latitude, distanceKm } = eclipticOf(body, instant);
  const speed = longitudeSpeed(body, instant);
  return { body, longitude, latitude, distanceKm, speed, retrograde: speed < 0 };
}

export function allPositions(instant: Date): BodyPosition[] {
  return BODY_IDS.map((b) => bodyPosition(b, instant));
}
