import type { Metric } from "@/lib/types";
import { Sparkline } from "./Sparkline";
import { formatMetricValue, formatDelta, deltaTone } from "@/lib/format";

export function MetricTile({ metric }: { metric: Metric }) {
  const higherIsBetter = metric.higherIsBetter ?? true;
  const tone = deltaTone(metric.deltaPct, higherIsBetter);
  const delta = formatDelta(metric.deltaPct);
  const deltaCls = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
  const sparkTone = metric.series ? (tone === "good" ? "good" : tone === "bad" ? "bad" : "accent") : "muted";
  const hasSpark = metric.series && metric.series.length > 1;

  return (
    <div className="rounded-md bg-panel2/60 px-2 py-1.5" title={metric.note || undefined}>
      <div className="flex items-baseline justify-between gap-1.5">
        <span className="truncate text-[11px] text-muted">{metric.label}</span>
        {delta && <span className={`shrink-0 text-[11px] font-medium ${deltaCls}`}>{delta}</span>}
      </div>
      <div className="mt-0.5 flex items-end justify-between gap-2">
        <span className="text-base font-semibold leading-none tabular-nums">{formatMetricValue(metric.value, metric.unit)}</span>
        {hasSpark && (
          <div className="h-6 w-16 shrink-0">
            <Sparkline data={metric.series} tone={sparkTone} />
          </div>
        )}
      </div>
    </div>
  );
}
