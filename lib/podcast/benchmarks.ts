/**
 * Industry benchmarks: downloads in the FIRST 7 DAYS after an episode
 * publishes. This is the one number the whole industry compares on, because
 * it's host-agnostic and time-normalized.
 *
 * Default tiers are based on Buzzsprout's published global platform stats
 * (updated monthly at buzzsprout.com/global_stats) and are directionally
 * consistent with Libsyn's "The Feed" numbers. They move slowly — revisit
 * quarterly and just edit the numbers below.
 */
export interface BenchmarkTier {
  /** e.g. "Top 10%" */
  label: string;
  percentile: number; // 1 = top 1%
  /** minimum downloads in the first 7 days to reach this tier */
  downloads7d: number;
}

export const DOWNLOAD_BENCHMARKS: BenchmarkTier[] = [
  { label: "Top 1%", percentile: 1, downloads7d: 4200 },
  { label: "Top 5%", percentile: 5, downloads7d: 1100 },
  { label: "Top 10%", percentile: 10, downloads7d: 440 },
  { label: "Top 25%", percentile: 25, downloads7d: 140 },
  { label: "Top 50%", percentile: 50, downloads7d: 30 },
];

/** The tier an episode's first-7-day downloads lands in (null = bottom half). */
export function benchmarkFor(downloads7d: number): BenchmarkTier | null {
  for (const tier of DOWNLOAD_BENCHMARKS) {
    if (downloads7d >= tier.downloads7d) return tier;
  }
  return null;
}

/** Median first-7-day downloads across recent episodes — the show's "typical episode". */
export function medianDownloads7d(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
