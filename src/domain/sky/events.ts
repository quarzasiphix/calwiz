/**
 * Unified sky-event timeline for a time range. Every screen that lists
 * "what happens when" reads from here.
 */
import { PLANET_IDS, type BodyId } from "../astronomy/bodies";
import { phaseEventsBetween, type PrincipalPhase } from "../astronomy/moon";
import {
  boundaryCrossingsBetween,
  eclipsesBetween,
  lunarApsidesBetween,
  seasonsBetween,
  stationsBetween,
  type EclipseKind,
  type SeasonKind,
} from "../astronomy/search";
import { ayanamsa, SIGNS, type SignName, type ZodiacSystem } from "../astrology/zodiac";
import { memo } from "../cache";

export type SkyEvent =
  | { kind: "moonPhase"; instant: Date; phase: PrincipalPhase }
  | { kind: "eclipse"; instant: Date; body: "Moon" | "Sun"; eclipse: EclipseKind }
  | { kind: "season"; instant: Date; season: SeasonKind }
  | { kind: "apsis"; instant: Date; apsis: "perigee" | "apogee"; distanceKm: number }
  | { kind: "station"; instant: Date; body: BodyId; turnsTo: "retrograde" | "direct" }
  | { kind: "ingress"; instant: Date; body: BodyId; sign: SignName; retrograde: boolean; zodiac: ZodiacSystem };

export type SkyEventKind = SkyEvent["kind"];

export interface EventOptions {
  zodiac: ZodiacSystem;
  /** The Moon changes sign every ~2.5 days; noisy, so optional. */
  moonIngresses: boolean;
}

const INGRESS_BODIES: BodyId[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

function compute(start: Date, end: Date, opts: EventOptions): SkyEvent[] {
  const out: SkyEvent[] = [];
  for (const e of phaseEventsBetween(start, end)) out.push({ kind: "moonPhase", instant: e.instant, phase: e.phase });
  for (const e of eclipsesBetween(start, end)) out.push({ kind: "eclipse", instant: e.instant, body: e.body, eclipse: e.kind });
  for (const e of seasonsBetween(start, end)) out.push({ kind: "season", instant: e.instant, season: e.kind });
  for (const e of lunarApsidesBetween(start, end)) out.push({ kind: "apsis", instant: e.instant, apsis: e.kind, distanceKm: e.distanceKm });
  for (const body of PLANET_IDS) {
    for (const e of stationsBetween(body, start, end)) out.push({ kind: "station", instant: e.instant, body, turnsTo: e.turnsTo });
  }
  const offset = opts.zodiac === "sidereal" ? ayanamsa(start) : 0;
  const bodies = opts.moonIngresses ? [...INGRESS_BODIES, "Moon" as const] : INGRESS_BODIES;
  for (const body of bodies) {
    for (const c of boundaryCrossingsBetween(body, start, end, offset)) {
      out.push({ kind: "ingress", instant: c.instant, body, sign: SIGNS[c.segment]!, retrograde: c.retrograde, zodiac: opts.zodiac });
    }
  }
  return out.sort((a, b) => a.instant.getTime() - b.instant.getTime());
}

/** Events in [start, end). Memoised by range and options. */
export function skyEventsBetween(start: Date, end: Date, opts: EventOptions): SkyEvent[] {
  return memo("events", `${start.getTime()}|${end.getTime()}|${opts.zodiac}|${opts.moonIngresses}`, () => compute(start, end, opts));
}

/** Relative importance, for choosing what to surface first. */
export function eventWeight(e: SkyEvent): number {
  switch (e.kind) {
    case "eclipse":
      return 100;
    case "season":
      return 80;
    case "moonPhase":
      return e.phase === "full" || e.phase === "new" ? 70 : 50;
    case "station":
      return 60;
    case "ingress":
      return e.body === "Sun" ? 55 : e.body === "Moon" ? 10 : ["Mercury", "Venus", "Mars"].includes(e.body) ? 40 : 45;
    case "apsis":
      return 20;
  }
}
