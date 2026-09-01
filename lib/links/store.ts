import type { MetricPoint } from "../types";
import { makeDailySeries } from "../mock";
import { TRACKED_LINKS, type TrackedLink } from "./config";

/**
 * Click store for the /go/[slug] attribution links.
 *
 * Demo mode: each link is seeded with a plausible 90-day click history so the
 * card isn't empty, and every REAL click on /go/... is counted on top —
 * try it: open /go/freebie and watch the card tick up on the next refresh.
 *
 * The in-memory map resets when the server restarts. For production, persist
 * each click (slug + timestamp) to something tiny — SQLite, Postgres, or
 * Vercel KV — and drop the seeded series. The connector reads only
 * `clicksToday()` and `seededSeries()`, so that's the whole swap.
 */

const liveClicks = new Map<string, number>(); // slug -> clicks since server start

export function getLink(slug: string): TrackedLink | undefined {
  return TRACKED_LINKS.find((l) => l.slug === slug);
}

export function recordClick(slug: string): void {
  liveClicks.set(slug, (liveClicks.get(slug) ?? 0) + 1);
}

export function liveClickCount(slug: string): number {
  return liveClicks.get(slug) ?? 0;
}

/** Seeded demo history for a link (deterministic, oldest -> newest). */
export function seededSeries(slug: string, days: number): MetricPoint[] {
  // Different offers pull differently: calls are rarer than freebies.
  const base = slug === "freebie" ? 9 : slug === "course" ? 4 : 1.6;
  return makeDailySeries({ seed: `links.${slug}`, days, base, noise: 0.7, weekendDip: false });
}
