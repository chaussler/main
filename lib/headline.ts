import type { DashboardSnapshot, Metric } from "./types";
import { benchmarkFor, medianDownloads7d } from "./podcast/benchmarks";

export interface HeadlineStat {
  key: string;
  label: string;
  value: number;
  unit: "count" | "currency";
  /** when set, shown instead of the formatted number (e.g. "Top 10%") */
  displayValue?: string;
  deltaPct?: number;
  hint?: string;
}

function findMetric(snap: DashboardSnapshot, connectorId: string, metricKey: string): Metric | undefined {
  const c = snap.connectors.find((c) => c.id === connectorId);
  return c?.metrics.find((m) => m.key === metricKey);
}

function sumMetrics(metrics: (Metric | undefined)[]): { value: number; deltaPct?: number } {
  const present = metrics.filter(Boolean) as Metric[];
  const value = present.reduce((a, m) => a + (m.value || 0), 0);
  // weighted-ish delta: weight each metric's delta by its value
  const withDelta = present.filter((m) => m.deltaPct !== undefined && m.value);
  if (!withDelta.length) return { value };
  const totalWeight = withDelta.reduce((a, m) => a + m.value, 0);
  const deltaPct = withDelta.reduce((a, m) => a + (m.deltaPct as number) * m.value, 0) / (totalWeight || 1);
  return { value, deltaPct: Math.round(deltaPct * 10) / 10 };
}

/** The big tiles at the top of the dashboard. Robust to missing connectors. */
export function computeHeadline(snap: DashboardSnapshot): HeadlineStat[] {
  const totalReach = sumMetrics([
    findMetric(snap, "host", "downloads_30d"),
    findMetric(snap, "youtube", "views_30d"),
    findMetric(snap, "social-clips", "clip_views_30d"),
  ]);

  const confirmedPlays = sumMetrics([
    findMetric(snap, "apple", "plays_30d"),
    findMetric(snap, "spotify", "streams_30d"),
    findMetric(snap, "youtube", "views_30d"),
  ]);

  const downloads = findMetric(snap, "host", "downloads_30d");

  const followers = sumMetrics([
    findMetric(snap, "apple", "followers"),
    findMetric(snap, "spotify", "followers"),
    findMetric(snap, "youtube", "subscribers"),
    findMetric(snap, "email-list", "subscribers"),
  ]);

  const ctaClicks = findMetric(snap, "attribution", "clicks_30d");

  const typical = medianDownloads7d(snap.episodes.slice(0, 8).map((e) => e.downloads7d));
  const tier = benchmarkFor(typical);

  return [
    {
      key: "total_reach",
      label: "Total reach (30d)",
      value: totalReach.value,
      unit: "count",
      deltaPct: totalReach.deltaPct,
      hint: "Downloads + YouTube views + clip views. Different depths of attention — the honest upper bound of eyes & ears.",
    },
    {
      key: "confirmed_plays",
      label: "Confirmed plays (30d)",
      value: confirmedPlays.value,
      unit: "count",
      deltaPct: confirmedPlays.deltaPct,
      hint: "Apple plays + Spotify streams + YouTube views — someone actually pressed play, unlike a download.",
    },
    {
      key: "downloads_30d",
      label: "RSS downloads (30d)",
      value: downloads?.value ?? 0,
      unit: "count",
      deltaPct: downloads?.deltaPct,
      hint: "What the host reports. A delivery metric, not a listening metric.",
    },
    {
      key: "followers",
      label: "Total followers",
      value: followers.value,
      unit: "count",
      deltaPct: followers.deltaPct,
      hint: "Apple + Spotify followers + YouTube subs + email list — the audience you own vs. rent.",
    },
    {
      key: "cta_clicks",
      label: "CTA clicks (30d)",
      value: ctaClicks?.value ?? 0,
      unit: "count",
      deltaPct: ctaClicks?.deltaPct,
      hint: "Clicks on your /go/ attribution links — proof the show moves people toward your offers.",
    },
    {
      key: "benchmark",
      label: "Industry standing",
      value: tier?.percentile ?? 100,
      unit: "count",
      displayValue: tier ? tier.label : "Bottom 50%",
      hint: `Typical episode gets ~${typical.toLocaleString()} downloads in its first 7 days, ranked against all podcasts (Buzzsprout global stats).`,
    },
  ];
}
