/**
 * Builds the context sent to (or copied for) an AI model.
 *
 * Only deterministic, computed values go in — the model is asked to
 * interpret them, never to calculate or invent positions. Birth date, time
 * and place are NOT included; only numbers derived from them.
 */
import { PHASE_NAMES } from "@/domain/astronomy/moon";
import { ASPECT_LABEL } from "@/domain/astrology/aspects";
import { formatPlacement } from "@/domain/astrology/zodiac";
import type { DayDetail } from "@/domain/sky/day";
import type { CivilDate } from "@/domain/time/civil";
import type { Profile } from "@/features/profile/schema";
import { describeEvent } from "@/features/shared/format";

export const AI_CONTEXT_VERSION = 2;

export interface AiContext {
  version: typeof AI_CONTEXT_VERSION;
  app: "calwiz";
  date: CivilDate;
  timeZone: string;
  instant: string;
  conventions: { zodiac: string; positions: string; numerology: string };
  moon: {
    phase: string;
    illuminationPercent: number;
    waxing: boolean;
    ageDays: number;
    lunationProgressPercent: number;
    nextFullMoon: string;
    nextNewMoon: string;
    distanceKm: number;
  };
  positions: { body: string; placement: string; longitude: number; retrograde: boolean }[];
  aspects: { between: string; aspect: string; orbDegrees: number; applying: boolean | null }[];
  events: { title: string; at: string }[];
  numerology: {
    universalDay: number;
    universalMonth: number;
    universalYear: number;
    personal?: { lifePath: number; personalYear: number; personalMonth: number; personalDay: number };
  };
  dayRuler: string;
}

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export function buildAiContext(date: CivilDate, d: DayDetail, profile: Profile, includePersonal: boolean): AiContext {
  const n = d.numbers;
  return {
    version: AI_CONTEXT_VERSION,
    app: "calwiz",
    date,
    timeZone: profile.timeZone,
    instant: d.instant.toISOString(),
    conventions: {
      zodiac: profile.zodiac === "tropical" ? "tropical" : "sidereal (Chitrapaksha ayanamsa, Spica at 180°)",
      positions: "geocentric apparent ecliptic longitude of date, computed with astronomy-engine",
      numerology: "Pythagorean; month, day and year reduced separately, master numbers 11/22/33 kept",
    },
    moon: {
      phase: PHASE_NAMES[d.moonState.phase],
      illuminationPercent: round(d.moonState.illumination * 100, 1),
      waxing: d.moonState.waxing,
      ageDays: round(d.moonState.ageDays, 1),
      lunationProgressPercent: round(d.moonState.cycleFraction * 100, 1),
      nextFullMoon: d.moonState.next.full.toISOString(),
      nextNewMoon: d.moonState.next.new.toISOString(),
      distanceKm: Math.round(d.moonState.distanceKm),
    },
    positions: d.positions.map((p) => ({ body: p.body, placement: formatPlacement(p.placement), longitude: round(p.zodiacLongitude, 2), retrograde: p.retrograde })),
    aspects: d.aspects.slice(0, 12).map((a) => ({ between: `${a.a}–${a.b}`, aspect: ASPECT_LABEL[a.kind], orbDegrees: round(a.orb, 1), applying: a.applying })),
    events: d.events.map((e) => ({ title: describeEvent(e).title, at: e.instant.toISOString() })),
    numerology: {
      universalDay: n.universalDay.value,
      universalMonth: n.universalMonth.value,
      universalYear: n.universalYear.value,
      ...(includePersonal && n.personal
        ? { personal: { lifePath: n.personal.lifePath.value, personalYear: n.personal.year.value, personalMonth: n.personal.month.value, personalDay: n.personal.day.value } }
        : {}),
    },
    dayRuler: d.dayRuler,
  };
}

export const SYSTEM_GUIDANCE = `You are the interpretation layer of Calwiz, a cosmic calendar.
The JSON context contains values computed by an astronomy engine and a numerology engine. Treat them as ground truth.
- Never invent or recalculate positions, phases, houses, aspects or numbers. If something isn't in the context, say it isn't available.
- Present astrology and numerology as symbolic traditions, not scientific predictions. No medical, legal or financial advice.
- Be specific to the given values; avoid generic horoscope filler. Keep answers under 200 words unless asked for more.
- When asked how something was calculated, explain the stated conventions.`;

export function promptFor(context: AiContext, question: string): string {
  return `${SYSTEM_GUIDANCE}\n\nQuestion: ${question || "Give a short, grounded reading of this day."}\n\nContext (JSON):\n${JSON.stringify(context, null, 2)}`;
}
