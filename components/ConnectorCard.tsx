import type { ConnectorResult } from "@/lib/types";
import { MetricTile } from "./MetricTile";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "@/lib/format";

export function ConnectorCard({ connector }: { connector: ConnectorResult }) {
  return (
    <section className="rounded-xl border border-white/5 bg-panel p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{connector.name}</h3>
          <p className="text-[11px] uppercase tracking-wide text-muted">{connector.category}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={connector.status} />
          <span className="text-[10px] text-muted">{timeAgo(connector.lastSync)}</span>
        </div>
      </header>

      {connector.status === "error" ? (
        <div className="rounded-lg bg-bad/10 p-3 text-xs text-bad">{connector.error || "Failed to load."}</div>
      ) : connector.metrics.length === 0 ? (
        <div className="rounded-lg bg-panel2/60 p-3 text-xs text-muted">No metrics yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {connector.metrics.map((m) => (
            <MetricTile key={m.key} metric={m} />
          ))}
        </div>
      )}

      {connector.setupHint && (
        <p className="mt-3 border-t border-white/5 pt-2 text-[11px] leading-snug text-muted">
          <span className="font-medium text-muted/80">Wiring:</span> {connector.setupHint}
        </p>
      )}
    </section>
  );
}
