/**
 * Zodiac conventions.
 *
 * - **Tropical** (default): 0° Aries = the March-equinox point of date. Signs
 *   are 30° segments of ecliptic longitude measured from it.
 * - **Sidereal (Chitrapaksha / Lahiri family)**: longitudes are shifted by an
 *   ayanamsa defined so the star Spica (α Virginis) sits at exactly 180°
 *   (0° Libra). We compute it directly from Spica's catalogue position
 *   precessed to date ("true Chitra" ayanamsa). It differs from the Indian
 *   Ephemeris "Lahiri" value by well under 0.01°, i.e. seconds of time for
 *   sign changes of everything except the Moon (≈ 1 min).
 */
import { MakeTime, RotateVector, Rotation_EQJ_ECT, SphereFromVector, Spherical, VectorFromSphere } from "astronomy-engine";
import { normalizeDegrees } from "../astronomy/angles";

export type ZodiacSystem = "tropical" | "sidereal";

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type SignName = (typeof SIGNS)[number];

/** Text-presentation glyphs (U+FE0E forces non-emoji rendering). */
export const SIGN_GLYPHS: Record<SignName, string> = {
  Aries: "♈︎", Taurus: "♉︎", Gemini: "♊︎", Cancer: "♋︎", Leo: "♌︎", Virgo: "♍︎",
  Libra: "♎︎", Scorpio: "♏︎", Sagittarius: "♐︎", Capricorn: "♑︎", Aquarius: "♒︎", Pisces: "♓︎",
};

export type Element = "Fire" | "Earth" | "Air" | "Water";
export type Modality = "Cardinal" | "Fixed" | "Mutable";

export const SIGN_ELEMENT: Element[] = ["Fire", "Earth", "Air", "Water"];
export const SIGN_MODALITY: Modality[] = ["Cardinal", "Fixed", "Mutable"];

export function elementOf(signIndex: number): Element {
  return SIGN_ELEMENT[signIndex % 4]!;
}
export function modalityOf(signIndex: number): Modality {
  return SIGN_MODALITY[signIndex % 3]!;
}

// Spica, ICRS J2000 (Hipparcos): RA 13h25m11.579s, Dec −11°09′40.75″.
const SPICA_RA_DEG = (13 + 25 / 60 + 11.579 / 3600) * 15;
const SPICA_DEC_DEG = -(11 + 9 / 60 + 40.75 / 3600);

const ayanamsaCache = new Map<number, number>();

/** Sidereal offset (degrees) at an instant. Cached per day — it changes 0.00004°/day. */
export function ayanamsa(instant: Date): number {
  const key = Math.floor(instant.getTime() / 86_400_000);
  const hit = ayanamsaCache.get(key);
  if (hit !== undefined) return hit;
  const t = MakeTime(new Date(key * 86_400_000));
  const eqj = VectorFromSphere(new Spherical(SPICA_DEC_DEG, SPICA_RA_DEG, 1), t);
  const ect = RotateVector(Rotation_EQJ_ECT(t), eqj);
  const lon = SphereFromVector(ect).lon;
  const value = normalizeDegrees(lon - 180);
  ayanamsaCache.set(key, value);
  return value;
}

/** Convert a tropical longitude to the requested zodiac. */
export function zodiacLongitude(tropicalLongitude: number, system: ZodiacSystem, instant: Date): number {
  return system === "tropical" ? normalizeDegrees(tropicalLongitude) : normalizeDegrees(tropicalLongitude - ayanamsa(instant));
}

export interface SignPlacement {
  sign: SignName;
  signIndex: number;
  /** Degrees within the sign, [0, 30). */
  degree: number;
  longitude: number;
}

export function placement(longitude: number): SignPlacement {
  const lon = normalizeDegrees(longitude);
  const signIndex = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[signIndex]!, signIndex, degree: lon - signIndex * 30, longitude: lon };
}

/** "17°42′ Scorpio" — degrees and arcminutes, truncated (astrological convention). */
export function formatPlacement(p: SignPlacement, opts: { glyph?: boolean } = {}): string {
  const d = Math.floor(p.degree);
  const m = Math.floor((p.degree - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′ ${opts.glyph ? SIGN_GLYPHS[p.sign] + " " : ""}${p.sign}`;
}

export function signIndexOf(name: SignName): number {
  return SIGNS.indexOf(name);
}
