import type { ConnectorResult } from "@/lib/types";
import { MetricTile } from "./MetricTile";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "@/lib/format";

export function ConnectorCard({ connector, showHint = false }: { connector: ConnectorResult; showHint?: boolean }) {
  return (
    <section className="flex flex-col rounded-lg border border-white/5 bg-panel p-3 shadow-sm">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{connector.name}</h3>
          <p className="text-[10px] uppercase tracking-wide text-muted">{connector.category}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <StatusBadge status={connector.status} />
          <span className="text-[10px] text-muted">{timeAgo(connector.lastSync)}</span>
        </div>
      </header>

      {connector.status === "error" ? (
        <div className="rounded bg-bad/10 p-2 text-xs text-bad">{connector.error || "Failed to load."}</div>
      ) : connector.metrics.length === 0 ? (
        <div className="rounded bg-panel2/60 p-2 text-xs text-muted">No metrics yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {connector.metrics.map((m) => (
            <MetricTile key={m.key} metric={m} />
          ))}
        </div>
      )}

      {showHint && connector.setupHint && (
        <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-snug text-muted">
          <span className="font-medium text-muted/80">Wiring:</span> {connector.setupHint}
        </p>
      )}
    </section>
  );
}
