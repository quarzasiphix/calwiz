/**
 * Ptolemaic (major) aspects between ecliptic longitudes.
 *
 * Orbs are a matter of tradition, not physics; defaults follow common modern
 * practice and are user-configurable. An aspect is "applying" when the
 * separation from exactness is shrinking (computed from apparent speeds).
 */
import { separation } from "../astronomy/angles";
import type { BodyId, BodyPosition } from "../astronomy/bodies";

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export const ASPECT_ANGLE: Record<AspectKind, number> = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };
export const ASPECT_GLYPH: Record<AspectKind, string> = { conjunction: "☌", sextile: "✱", square: "□", trine: "△", opposition: "☍" };
export const ASPECT_LABEL: Record<AspectKind, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
};

export type Orbs = Record<AspectKind, number>;
export const DEFAULT_ORBS: Orbs = { conjunction: 8, opposition: 8, square: 7, trine: 7, sextile: 5 };

export interface Aspect {
  a: BodyId;
  b: BodyId;
  kind: AspectKind;
  /** |actual separation − exact angle|, degrees. */
  orb: number;
  applying: boolean | null;
}

export interface AspectInput {
  body: BodyId;
  longitude: number;
  speed?: number;
}

export function findAspects(points: AspectInput[], orbs: Orbs = DEFAULT_ORBS): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p = points[i]!;
      const q = points[j]!;
      const sep = separation(p.longitude, q.longitude);
      let best: { kind: AspectKind; orb: number } | null = null;
      for (const kind of Object.keys(ASPECT_ANGLE) as AspectKind[]) {
        const orb = Math.abs(sep - ASPECT_ANGLE[kind]);
        if (orb <= orbs[kind] && (!best || orb < best.orb)) best = { kind, orb };
      }
      if (!best) continue;
      let applying: boolean | null = null;
      if (p.speed !== undefined && q.speed !== undefined) {
        // Separation one hour later, using linear motion.
        const dt = 1 / 24;
        const later = separation(p.longitude + p.speed * dt, q.longitude + q.speed * dt);
        applying = Math.abs(later - ASPECT_ANGLE[best.kind]) < best.orb;
      }
      out.push({ a: p.body, b: q.body, kind: best.kind, orb: best.orb, applying });
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export function aspectsFromPositions(positions: BodyPosition[], orbs?: Orbs): Aspect[] {
  return findAspects(positions.map((p) => ({ body: p.body, longitude: p.longitude, speed: p.speed })), orbs);
}

/** Aspects between two sets (e.g. transits to natal). Points in `b` are treated as fixed. */
export function crossAspects(a: AspectInput[], b: AspectInput[], orbs: Orbs = DEFAULT_ORBS): (Aspect & { natal: true })[] {
  const out: (Aspect & { natal: true })[] = [];
  for (const p of a) {
    for (const q of b) {
      const sep = separation(p.longitude, q.longitude);
      for (const kind of Object.keys(ASPECT_ANGLE) as AspectKind[]) {
        const orb = Math.abs(sep - ASPECT_ANGLE[kind]);
        if (orb <= orbs[kind]) {
          const later = p.speed === undefined ? null : separation(p.longitude + p.speed / 24, q.longitude);
          out.push({ a: p.body, b: q.body, kind, orb, applying: later === null ? null : Math.abs(later - ASPECT_ANGLE[kind]) < orb, natal: true });
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

