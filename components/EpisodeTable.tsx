import type { EpisodeStats } from "@/lib/types";
import { benchmarkFor } from "@/lib/podcast/benchmarks";
import { formatNumber } from "@/lib/format";

function BenchBadge({ downloads7d }: { downloads7d: number }) {
  const tier = benchmarkFor(downloads7d);
  const label = tier ? tier.label : "Bottom 50%";
  const cls =
    !tier ? "border-line bg-panel2 text-muted"
    : tier.percentile <= 5 ? "border-good/30 bg-good/10 text-good"
    : tier.percentile <= 25 ? "border-accent/30 bg-accent/10 text-accent"
    : "border-warn/30 bg-warn/10 text-warn";
  return (
    <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>
  );
}

/** Per-episode performance across platforms, newest first. */
export function EpisodeTable({ episodes }: { episodes: EpisodeStats[] }) {
  if (!episodes.length) return null;
  return (
    <section className="rounded-lg border border-line bg-panel p-3 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Episode performance</h3>
        <span className="text-[11px] text-muted">first-7-day downloads decide the benchmark</span>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
              <th className="py-1.5 pr-3 font-medium">Episode</th>
              <th className="py-1.5 pr-3 font-medium">Published</th>
              <th className="py-1.5 pr-3 text-right font-medium">First 7d</th>
              <th className="py-1.5 pr-3 text-right font-medium">All-time</th>
              <th className="py-1.5 pr-3 text-right font-medium">YouTube</th>
              <th className="py-1.5 pr-3 text-right font-medium" title="Average % of the episode actually listened to (Apple/Spotify)">Consumed</th>
              <th className="py-1.5 font-medium">Benchmark</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((e) => (
              <tr key={e.id} className="border-b border-line/50 last:border-0">
                <td className="max-w-[280px] truncate py-1.5 pr-3 text-ink" title={e.title}>{e.title}</td>
                <td className="whitespace-nowrap py-1.5 pr-3 text-muted">{e.publishedAt}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-ink">{formatNumber(e.downloads7d)}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-muted">{formatNumber(e.downloadsAllTime)}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-muted">{formatNumber(e.youtubeViews)}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-muted">{e.avgConsumptionPct != null ? `${e.avgConsumptionPct}%` : "—"}</td>
                <td className="py-1.5"><BenchBadge downloads7d={e.downloads7d} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
