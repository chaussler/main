import type { ConnectorStatus } from "@/lib/types";

const MAP: Record<ConnectorStatus, { label: string; cls: string; title: string }> = {
  live: { label: "live", cls: "bg-good/15 text-good border-good/30", title: "Connected to the real API" },
  mock: { label: "demo data", cls: "bg-accent/15 text-accent border-accent/30", title: "Showing sample data — add API credentials to go live" },
  manual: { label: "manual", cls: "bg-warn/15 text-warn border-warn/30", title: "No API available — numbers entered by hand / from a sheet" },
  error: { label: "error", cls: "bg-bad/15 text-bad border-bad/30", title: "This source failed to load" },
};

export function StatusBadge({ status }: { status: ConnectorStatus }) {
  const s = MAP[status];
  return (
    <span title={s.title} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}
