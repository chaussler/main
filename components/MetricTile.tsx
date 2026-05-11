import type { Metric } from "@/lib/types";
import { Sparkline } from "./Sparkline";
import { formatMetricValue, formatDelta, deltaTone } from "@/lib/format";

export function MetricTile({ metric }: { metric: Metric }) {
  const higherIsBetter = metric.higherIsBetter ?? true;
  const tone = deltaTone(metric.deltaPct, higherIsBetter);
  const delta = formatDelta(metric.deltaPct);
  const deltaCls = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
  const sparkTone = metric.series ? (tone === "good" ? "good" : tone === "bad" ? "bad" : "accent") : "muted";

  return (
    <div className="rounded-lg bg-panel2/60 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted">{metric.label}</span>
        {delta && <span className={`text-xs font-medium ${deltaCls}`}>{delta}</span>}
      </div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{formatMetricValue(metric.value, metric.unit)}</div>
      {metric.series && metric.series.length > 1 && <Sparkline data={metric.series} tone={sparkTone} />}
      {metric.note && <div className="mt-1 text-[11px] text-muted">{metric.note}</div>}
    </div>
  );
}
