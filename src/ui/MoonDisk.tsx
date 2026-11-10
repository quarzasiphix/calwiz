/**
 * Moon disk renderer.
 *
 * Geometry is exact: the lit region is bounded by the bright limb (a
 * semicircle) and the terminator (a half-ellipse whose semi-axis is
 * r·|1 − 2k| for illuminated fraction k). The disk is rotated so the bright
 * limb faces the Sun's position angle (Meeus 48.5), north up — or zenith up
 * when a parallactic angle is supplied ("as seen in your sky").
 *
 * The surface texture (maria, Tycho) is an illustrative approximation, not a
 * photographic map; it is fixed north-up and ignores libration.
 */
import { useId } from "react";

export interface MoonDiskProps {
  /** Illuminated fraction, 0–1. */
  illumination: number;
  /** Position angle of the bright limb, degrees from north through east. */
  brightLimbAngle: number;
  /** Degrees to rotate north-up into the observer's zenith-up frame. */
  parallacticAngle?: number;
  size: number;
  /** Render surface detail (skip for tiny calendar icons). */
  detail?: boolean;
  /** Accessible description; omit to mark decorative. */
  label?: string;
  className?: string;
}

const MARIA: [cx: number, cy: number, rx: number, ry: number, o: number][] = [
  [-0.55, -0.05, 0.36, 0.42, 0.5], // Oceanus Procellarum
  [-0.3, -0.42, 0.27, 0.24, 0.55], // Imbrium
  [0.18, -0.38, 0.17, 0.16, 0.55], // Serenitatis
  [0.32, -0.08, 0.2, 0.17, 0.55], // Tranquillitatis
  [0.66, -0.3, 0.11, 0.09, 0.6], // Crisium
  [0.55, 0.16, 0.12, 0.15, 0.45], // Fecunditatis
  [0.33, 0.3, 0.09, 0.09, 0.45], // Nectaris
  [-0.2, 0.38, 0.17, 0.13, 0.45], // Nubium
  [-0.5, 0.36, 0.1, 0.09, 0.5], // Humorum
  [-0.05, -0.7, 0.42, 0.07, 0.4], // Frigoris
  [0.05, 0.05, 0.08, 0.07, 0.35], // Vaporum / Sinus Medii
];

export function MoonDisk({ illumination, brightLimbAngle, parallacticAngle = 0, size, detail = true, label, className }: MoonDiskProps) {
  const uid = useId().replace(/:/g, "");
  const r = 50;
  const k = Math.min(1, Math.max(0, illumination));
  const a = r * Math.abs(1 - 2 * k);
  const crescent = k < 0.5;

  // Screen angle of the bright limb: position angle measured N→E; with north
  // up and east to the left, PA χ points to (−sin χ, −cos χ).
  const pa = ((brightLimbAngle - parallacticAngle) * Math.PI) / 180;
  const rotation = (Math.atan2(-Math.cos(pa), -Math.sin(pa)) * 180) / Math.PI;
  const textureRotation = -parallacticAngle;

  // Lit region with bright limb on +x, then rotated.
  const lit =
    k <= 0.0005
      ? ""
      : k >= 0.9995
        ? `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`
        : `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${a} ${r} 0 0 ${crescent ? 0 : 1} 0 ${-r} Z`;

  return (
    <svg
      viewBox="-52 -52 104 104"
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={`d${uid}`}>
          <circle r={r} />
        </clipPath>
        <clipPath id={`l${uid}`}>
          <path d={lit} transform={`rotate(${rotation})`} />
        </clipPath>
        <radialGradient id={`g${uid}`} cx="0" cy="0" r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="rgb(var(--moon))" />
          <stop offset="1" stopColor="rgb(var(--moon))" stopOpacity="0.78" />
        </radialGradient>
        {detail && (
          <filter id={`b${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.4" />
          </filter>
        )}
      </defs>

      {/* Unlit disk with faint earthshine */}
      <circle r={r} fill="rgb(var(--moon-shadow))" />
      {detail && (
        <g clipPath={`url(#d${uid})`} opacity="0.09" transform={`rotate(${textureRotation})`}>
          <Texture blurId={`b${uid}`} r={r} light />
        </g>
      )}

      {/* Sunlit part */}
      {lit && (
        <g clipPath={`url(#l${uid})`}>
          <circle r={r} fill={`url(#g${uid})`} />
          {detail && (
            <g transform={`rotate(${textureRotation})`}>
              <Texture blurId={`b${uid}`} r={r} />
            </g>
          )}
        </g>
      )}
      <circle r={r - 0.4} fill="none" stroke="rgb(var(--moon))" strokeOpacity={detail ? 0.12 : 0.22} strokeWidth={detail ? 0.8 : 3} />
    </svg>
  );
}

function Texture({ blurId, r, light = false }: { blurId: string; r: number; light?: boolean }) {
  const fill = light ? "rgb(var(--moon))" : "rgb(70 72 88)";
  return (
    <g>
      <g filter={`url(#${blurId})`} fill={fill}>
        {MARIA.map(([cx, cy, rx, ry, o], i) => (
          <ellipse key={i} cx={cx * r} cy={cy * r} rx={rx * r} ry={ry * r} opacity={light ? o * 0.6 : o * 0.5} />
        ))}
      </g>
      {!light && (
        <g fill="white" opacity="0.3">
          <circle cx={-0.12 * r} cy={0.72 * r} r={1.6} />
          <circle cx={-0.34 * r} cy={-0.12 * r} r={1.1} opacity="0.8" />
        </g>
      )}
    </g>
  );
}
