/**
 * Zodiac wheel. Longitude increases counter-clockwise (astrological
 * convention). The `left` longitude sits at 9 o'clock — the Ascendant when a
 * natal chart is shown, otherwise 0° Aries.
 *
 * Planet glyphs that would overlap are nudged apart radially; a tick on the
 * inner ring always marks the exact longitude.
 */
import { ASPECT_ANGLE, type Aspect } from "@/domain/astrology/aspects";
import { BODY_GLYPH } from "@/domain/astrology/meanings";
import { SIGN_GLYPHS, SIGNS } from "@/domain/astrology/zodiac";
import type { BodyId } from "@/domain/astronomy/bodies";

export interface WheelPoint {
  body: BodyId;
  longitude: number;
  retrograde?: boolean;
}

export interface ZodiacWheelProps {
  points: WheelPoint[];
  aspects?: Aspect[];
  left?: number;
  cusps?: number[] | null;
  angles?: { ascendant: number; midheaven: number } | null;
  /** Second ring (e.g. natal points for transits). */
  inner?: WheelPoint[];
  size?: number;
  label: string;
  className?: string;
}

const ASPECT_STROKE: Record<string, string> = {
  conjunction: "rgb(var(--gold))",
  trine: "rgb(var(--sky))",
  sextile: "rgb(var(--sky))",
  square: "rgb(var(--rose))",
  opposition: "rgb(var(--rose))",
};

export function ZodiacWheel({ points, aspects = [], left = 0, cusps, angles, inner, size = 360, label, className }: ZodiacWheelProps) {
  const R = 200;
  const rSign = 172; // inner edge of sign band
  const rPlanet = 140;
  const rAspect = inner ? 78 : 108;
  const xy = (lon: number, r: number) => {
    const a = ((180 + lon - left) * Math.PI) / 180;
    return [r * Math.cos(a), -r * Math.sin(a)] as const;
  };
  const spread = (pts: WheelPoint[]) => {
    const sorted = [...pts].sort((a, b) => a.longitude - b.longitude);
    const placed: { p: WheelPoint; ring: number }[] = [];
    for (const p of sorted) {
      let ring = 0;
      while (placed.some((q) => q.ring === ring && Math.abs(((q.p.longitude - p.longitude + 540) % 360) - 180) < 7)) ring++;
      placed.push({ p, ring });
    }
    return placed;
  };
  const byBody = new Map(points.map((p) => [p.body, p]));

  return (
    <svg viewBox="-210 -210 420 420" width={size} height={size} className={className} role="img" aria-label={label}>
      <circle r={R} fill="rgb(var(--surface))" stroke="rgb(var(--line))" />
      <circle r={rSign} fill="none" stroke="rgb(var(--line))" />
      <circle r={rAspect} fill="none" stroke="rgb(var(--line))" strokeOpacity="0.6" />
      {/* Sign band */}
      {SIGNS.map((s, i) => {
        const [x1, y1] = xy(i * 30, rSign);
        const [x2, y2] = xy(i * 30, R);
        const [gx, gy] = xy(i * 30 + 15, (R + rSign) / 2);
        return (
          <g key={s}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--line))" />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="15" fill={i % 4 === 0 ? "rgb(var(--rose))" : i % 4 === 1 ? "rgb(var(--gold))" : i % 4 === 2 ? "rgb(var(--sky))" : "rgb(var(--muted))"} opacity="0.85">
              {SIGN_GLYPHS[s]}
            </text>
          </g>
        );
      })}
      {/* Degree ticks */}
      {Array.from({ length: 72 }, (_, i) => {
        const [x1, y1] = xy(i * 5, rSign);
        const [x2, y2] = xy(i * 5, rSign - (i % 2 ? 3 : 6));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--line))" />;
      })}
      {/* Houses */}
      {cusps?.map((c, i) => {
        const [x1, y1] = xy(c, rAspect);
        const [x2, y2] = xy(c, rSign);
        const [nx, ny] = xy(c + 15, rAspect + 10);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--line))" strokeDasharray={i % 3 === 0 ? undefined : "2 3"} />
            <text x={nx} y={ny} fontSize="8" textAnchor="middle" dominantBaseline="central" fill="rgb(var(--faint))">
              {i + 1}
            </text>
          </g>
        );
      })}
      {angles &&
        (
          [
            ["AC", angles.ascendant],
            ["MC", angles.midheaven],
          ] as const
        ).map(([t, lon]) => {
          const [x1, y1] = xy(lon, rAspect);
          const [x2, y2] = xy(lon, R + 2);
          const [tx, ty] = xy(lon, R - 6);
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--gold))" strokeWidth="1.5" />
              <text x={tx} y={ty} fontSize="9" fill="rgb(var(--gold))" textAnchor="middle" dominantBaseline="central" fontWeight="600" style={{ paintOrder: "stroke" }} stroke="rgb(var(--surface))" strokeWidth="3">
                {t}
              </text>
            </g>
          );
        })}
      {/* Aspects */}
      {aspects.map((a, i) => {
        const p = byBody.get(a.a);
        const q = byBody.get(a.b) ?? inner?.find((x) => x.body === a.b);
        if (!p || !q || a.kind === "conjunction") return null;
        const [x1, y1] = xy(p.longitude, rAspect);
        const [x2, y2] = xy(q.longitude, rAspect);
        const strength = 1 - a.orb / 8;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ASPECT_STROKE[a.kind]} strokeOpacity={0.25 + 0.55 * strength} strokeWidth={a.kind === "square" || a.kind === "opposition" ? 1.2 : 1} data-angle={ASPECT_ANGLE[a.kind]} />;
      })}
      {/* Inner ring (natal) */}
      {inner &&
        spread(inner).map(({ p, ring }) => {
          const [gx, gy] = xy(p.longitude, rAspect + 14 + ring * 12);
          const [tx, ty] = xy(p.longitude, rAspect);
          return (
            <g key={`n-${p.body}`}>
              <circle cx={tx} cy={ty} r="1.6" fill="rgb(var(--gold))" />
              <text x={gx} y={gy} fontSize="11" textAnchor="middle" dominantBaseline="central" fill="rgb(var(--gold))">
                {BODY_GLYPH[p.body]}
              </text>
            </g>
          );
        })}
      {/* Planets */}
      {spread(points).map(({ p, ring }) => {
        const [gx, gy] = xy(p.longitude, rPlanet - ring * 17);
        const [tx1, ty1] = xy(p.longitude, rSign);
        const [tx2, ty2] = xy(p.longitude, rSign - 9);
        return (
          <g key={p.body}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="rgb(var(--ink))" strokeWidth="1.5" />
            <text x={gx} y={gy} fontSize="17" textAnchor="middle" dominantBaseline="central" fill="rgb(var(--ink))">
              {BODY_GLYPH[p.body]}
            </text>
            {p.retrograde && (
              <text x={gx + 10} y={gy + 8} fontSize="8" fill="rgb(var(--sky))">
                ℞
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
