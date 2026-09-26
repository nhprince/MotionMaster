// Shared numeric helpers. Kept dependency-free on purpose.

/** Parse a form field into a number, or null if left blank/invalid.
 *  Blank is treated as "unknown" — never silently coerced to 0. */
export function parseVal(str) {
  if (str === undefined || str === null) return null;
  const s = String(str).trim();
  if (s === '') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Format a number for display: fixed precision, trailing zeros trimmed. */
export function fmt(n, digits = 4) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  let v = n;
  if (Math.abs(v) < 1e-9) v = 0;
  const rounded = Number(v.toFixed(digits));
  return rounded.toString();
}

export const deg2rad = (d) => (d * Math.PI) / 180;
export const rad2deg = (r) => (r * 180) / Math.PI;

/** Solve 0.5*a*t^2 + u*t - s = 0 for the positive root t.
 *  Falls back to the linear case when a === 0. */
export function solveTimeFromDisplacement(u, a, s) {
  if (a === 0) {
    if (u === 0) return null;
    const t = s / u;
    return t >= 0 ? t : null;
  }
  const disc = u * u + 2 * a * s;
  if (disc < 0) return null;
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-u + sqrtDisc) / a;
  const t2 = (-u - sqrtDisc) / a;
  const candidates = [t1, t2].filter((t) => Number.isFinite(t) && t >= 0);
  if (candidates.length === 0) return null;
  return Math.min(...candidates);
}
