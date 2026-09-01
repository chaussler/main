import type { MetricPoint } from "./types";

// Tiny deterministic PRNG (mulberry32) so mock numbers are stable for a given
// seed/day instead of jittering on every request.
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoDay(daysAgo: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return dayKey(d);
}

/**
 * Build a plausible-looking historical series that trends upward (or downward)
 * with a bit of noise. Deterministic per `seed`.
 *
 * @param seed         stable identifier (e.g. "instagram.followers")
 * @param days         number of points (one per day, oldest -> newest)
 * @param start        starting value
 * @param dailyGrowth  fractional growth per day, e.g. 0.01 = +1%/day
 * @param noise        fractional noise amplitude, e.g. 0.03
 * @param integer      round to whole numbers
 */
export function makeSeries(opts: {
  seed: string;
  days: number;
  start: number;
  dailyGrowth: number;
  noise?: number;
  integer?: boolean;
  floor?: number;
}): MetricPoint[] {
  const { seed, days, start, dailyGrowth, noise = 0.04, integer = true, floor = 0 } = opts;
  const rand = mulberry32(hashString(seed));
  const points: MetricPoint[] = [];
  let value = start;
  for (let i = days - 1; i >= 0; i--) {
    const drift = 1 + dailyGrowth + (rand() - 0.5) * 2 * noise;
    value = Math.max(floor, value * drift);
    points.push({ date: isoDay(i), value: integer ? Math.round(value) : Math.round(value * 100) / 100 });
  }
  return points;
}

/** A "daily activity" series (e.g. emails sent that day) — flat-ish around a base. */
export function makeDailySeries(opts: {
  seed: string;
  days: number;
  base: number;
  noise?: number;
  integer?: boolean;
  weekendDip?: boolean;
}): MetricPoint[] {
  const { seed, days, base, noise = 0.35, integer = true, weekendDip = true } = opts;
  const rand = mulberry32(hashString(seed));
  const points: MetricPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDay(i);
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    const weekendFactor = weekendDip && (dow === 0 || dow === 6) ? 0.3 : 1;
    const v = Math.max(0, base * weekendFactor * (1 + (rand() - 0.5) * 2 * noise));
    points.push({ date, value: integer ? Math.round(v) : Math.round(v * 100) / 100 });
  }
  return points;
}

export function lastValue(series: MetricPoint[]): number {
  return series.length ? series[series.length - 1].value : 0;
}

export function sumLast(series: MetricPoint[], n: number): number {
  return series.slice(-n).reduce((a, p) => a + p.value, 0);
}

/** % change of the last point vs the point `lookback` days earlier. */
export function deltaPct(series: MetricPoint[], lookback = 7): number | undefined {
  if (series.length <= lookback) return undefined;
  const now = series[series.length - 1].value;
  const then = series[series.length - 1 - lookback].value;
  if (!then) return undefined;
  return Math.round(((now - then) / then) * 1000) / 10;
}

/** % change of the last N-day window vs the previous N-day window. */
export function windowDeltaPct(series: MetricPoint[], n = 7): number | undefined {
  if (series.length < n * 2) return undefined;
  const recent = sumLast(series, n);
  const prev = series.slice(-n * 2, -n).reduce((a, p) => a + p.value, 0);
  if (!prev) return undefined;
  return Math.round(((recent - prev) / prev) * 1000) / 10;
}
