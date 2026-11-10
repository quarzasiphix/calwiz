export const DEG = Math.PI / 180;

/** Normalise to [0, 360). */
export function normalizeDegrees(x: number): number {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

/** Normalise to (−180, 180]. */
export function signedAngle(x: number): number {
  const r = normalizeDegrees(x);
  return r > 180 ? r - 360 : r;
}

/** Smallest separation between two longitudes, [0, 180]. */
export function separation(a: number, b: number): number {
  return Math.abs(signedAngle(a - b));
}
