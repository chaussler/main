import type { DashboardSnapshot } from "@/lib/types";
import { DOWNLOAD_BENCHMARKS, benchmarkFor, medianDownloads7d } from "@/lib/podcast/benchmarks";

/**
 * "Where do we stand?" — the show's typical first-7-day downloads plotted
 * against the industry percentile ladder, so a podcaster sees at a glance
 * that (say) 380 downloads/episode already beats ~90% of all podcasts.
 */
export function BenchmarkPanel({ snap }: { snap: DashboardSnapshot }) {
  const typical = medianDownloads7d(snap.episodes.slice(0, 8).map((e) => e.downloads7d));
  const tier = benchmarkFor(typical);
  // Ladder is displayed smallest tier first (Top 50% ... Top 1%)
  const ladder = [...DOWNLOAD_BENCHMARKS].reverse();

  return (
    <section className="rounded-lg border border-line bg-panel p-3 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Industry benchmark</h3>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
          {tier ? tier.label : "Bottom 50%"}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Your typical episode: <span className="font-semibold tabular-nums text-ink">{typical.toLocaleString()}</span> downloads in its first 7 days
        (median of your last 8 episodes).
      </p>

      <ul className="mt-2.5 space-y-1">
        {ladder.map((t) => {
          const reached = typical >= t.downloads7d;
          const isCurrent = tier?.label === t.label;
          return (
            <li
              key={t.label}
              className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                isCurrent ? "bg-accent/15 text-ink" : reached ? "text-ink/80" : "text-muted"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${reached ? "bg-good" : "bg-line"}`} />
                {t.label} of all podcasts
                {isCurrent && <span className="ml-1 rounded bg-accent px-1 text-[9px] font-bold uppercase text-white">you</span>}
              </span>
              <span className="tabular-nums">{t.downloads7d.toLocaleString()}+ / first 7d</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-2.5 border-t border-line pt-2 text-[11px] leading-snug text-muted">
        Tiers from Buzzsprout&apos;s published global platform stats (all podcasts, first-7-day downloads). They shift slowly —
        update them in <code className="rounded bg-panel2 px-1">lib/podcast/benchmarks.ts</code> quarterly.
      </p>
    </section>
  );
}
