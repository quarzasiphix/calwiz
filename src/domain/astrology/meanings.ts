/**
 * Symbolic meanings used by Western astrological tradition.
 *
 * These are interpretive conventions — cultural and symbolic, not scientific
 * predictions. UI copy must present them that way ("traditionally associated
 * with…"), and must never mix them with computed data without labelling.
 */
import type { BodyId } from "../astronomy/bodies";
import type { PhaseKey } from "../astronomy/moon";
import type { AspectKind } from "./aspects";
import type { SignName } from "./zodiac";

export const BODY_GLYPH: Record<BodyId, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

export const BODY_THEME: Record<BodyId, string> = {
  Sun: "identity, vitality, purpose",
  Moon: "feelings, instinct, home and rhythm",
  Mercury: "thinking, speech, travel and trade",
  Venus: "affection, beauty, value and pleasure",
  Mars: "drive, courage, conflict and desire",
  Jupiter: "growth, generosity, belief and luck",
  Saturn: "structure, limits, time and responsibility",
  Uranus: "disruption, invention and independence",
  Neptune: "imagination, dissolution and longing",
  Pluto: "depth, power and transformation",
};

export const SIGN_THEME: Record<SignName, { keywords: string; ruler: BodyId; summary: string }> = {
  Aries: { keywords: "initiative · courage · impulse", ruler: "Mars", summary: "The first push of spring: starting things, acting before thinking, honest directness." },
  Taurus: { keywords: "steadiness · senses · value", ruler: "Venus", summary: "Slow ripening: comfort, patience, the body and what is worth keeping." },
  Gemini: { keywords: "curiosity · exchange · wit", ruler: "Mercury", summary: "Many conversations at once: learning, connecting, restless lightness." },
  Cancer: { keywords: "care · memory · belonging", ruler: "Moon", summary: "Shelter and roots: tending people, moods and the past." },
  Leo: { keywords: "warmth · expression · pride", ruler: "Sun", summary: "Midsummer heat: generosity, play, wanting to be seen." },
  Virgo: { keywords: "craft · discernment · service", ruler: "Mercury", summary: "Harvest sorting: refining, fixing, being useful." },
  Libra: { keywords: "balance · relating · grace", ruler: "Venus", summary: "The equinox scales: fairness, partnership, aesthetics." },
  Scorpio: { keywords: "intensity · depth · loyalty", ruler: "Mars", summary: "What lies beneath: trust, secrets, transformation through commitment." },
  Sagittarius: { keywords: "meaning · horizon · candour", ruler: "Jupiter", summary: "The long view: travel, philosophy, enthusiasm and overreach." },
  Capricorn: { keywords: "ambition · discipline · time", ruler: "Saturn", summary: "Winter building: structure, mastery, patient effort." },
  Aquarius: { keywords: "ideas · community · independence", ruler: "Saturn", summary: "The future-facing outsider: systems, friendship, principle." },
  Pisces: { keywords: "empathy · dream · surrender", ruler: "Jupiter", summary: "The ocean at year's end: compassion, art, letting go." },
};

export const ASPECT_THEME: Record<AspectKind, string> = {
  conjunction: "blend and intensify — the two themes act as one",
  sextile: "an opening; cooperation that needs a small effort",
  square: "friction that demands action or adjustment",
  trine: "ease and flow; talents that come naturally",
  opposition: "polarity and awareness; balancing two pulls",
};

export const PHASE_THEME: Record<PhaseKey, { short: string; long: string }> = {
  new: {
    short: "Beginnings in the dark",
    long: "The Moon sits between Earth and Sun and is invisible. Many traditions treat it as a time for intentions and quiet starts.",
  },
  waxingCrescent: {
    short: "Small steps, building",
    long: "A thin evening crescent, growing nightly. Symbolically, momentum gathers; plans take a first concrete form.",
  },
  firstQuarter: {
    short: "Decide and push",
    long: "Half lit, high in the evening sky at sunset. Traditionally a point of decision, effort and overcoming resistance.",
  },
  waxingGibbous: {
    short: "Refine before the peak",
    long: "More than half lit and still growing. A time associated with adjusting and preparing.",
  },
  full: {
    short: "Culmination, visibility",
    long: "Opposite the Sun, rising at sunset, up all night. Associated with completion, heightened feeling and things coming to light.",
  },
  waningGibbous: {
    short: "Share and digest",
    long: "Rising later each night after full. A time associated with gratitude, teaching and making sense of results.",
  },
  lastQuarter: {
    short: "Release and reassess",
    long: "Half lit, visible in the morning sky. Traditionally a turning point for clearing out and letting go.",
  },
  waningCrescent: {
    short: "Rest and close the cycle",
    long: "A thin crescent before dawn. Associated with rest, reflection and endings before the next new moon.",
  },
};

export const RETROGRADE_NOTE =
  "Retrograde motion is an optical effect: Earth overtakes (or is overtaken by) another planet, so it appears to drift backwards against the stars. Astrologers traditionally read it as a time to review that planet's themes.";
