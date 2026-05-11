"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardSnapshot } from "@/lib/types";
import { computeHeadline } from "@/lib/headline";
import { ConnectorCard } from "./ConnectorCard";
import { CATEGORY_ORDER } from "@/lib/connectors";
import { formatCurrency, formatNumber, formatDelta, deltaTone, timeAgo } from "@/lib/format";

const REFRESH_MS = 60_000;

export function Dashboard({ initial }: { initial: DashboardSnapshot }) {
  const [snap, setSnap] = useState<DashboardSnapshot>(initial);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0); // forces "x ago" labels to re-render

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (res.ok) setSnap((await res.json()) as DashboardSnapshot);
    } catch {
      /* keep showing the last good snapshot */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const a = setInterval(refresh, REFRESH_MS);
    const b = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [refresh]);

  const headline = computeHeadline(snap);
  const liveCount = snap.connectors.filter((c) => c.status === "live").length;

  // group connectors by category in display order
  const groups = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: snap.connectors.filter((c) => c.category === cat),
  })).filter((g) => g.items.length);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Business Dashboard</h1>
          <p className="text-sm text-muted">
            Every weekly touch point in one place · updated {timeAgo(snap.generatedAt)}
            <span className="sr-only">{tick}</span>
            {" · "}
            {liveCount}/{snap.connectors.length} sources live
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-panel px-3 py-1.5 text-sm font-medium text-muted hover:text-white disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {/* Headline tiles */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {headline.map((h) => {
          const tone = deltaTone(h.deltaPct, true);
          const delta = formatDelta(h.deltaPct);
          const deltaCls = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
          return (
            <div key={h.key} className="rounded-xl border border-white/5 bg-gradient-to-b from-panel2 to-panel p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted">{h.label}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">
                {h.unit === "currency" ? formatCurrency(h.value) : formatNumber(h.value)}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                {delta ? <span className={`font-medium ${deltaCls}`}>{delta}</span> : <span className="text-muted">·</span>}
                {h.hint && <span className="text-muted">{h.hint}</span>}
              </div>
            </div>
          );
        })}
      </section>

      {/* Channel sections */}
      {groups.map((g) => (
        <div key={g.category} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{g.category}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((c) => (
              <ConnectorCard key={c.id} connector={c} />
            ))}
          </div>
        </div>
      ))}

      <footer className="mt-10 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-muted">
        <p>
          <strong className="text-muted/80">Demo data</strong> is shown for any source without API credentials. Add keys to{" "}
          <code className="rounded bg-panel2 px-1">.env</code> (see <code className="rounded bg-panel2 px-1">.env.example</code>) to switch a source to{" "}
          <span className="text-good">live</span>. Sources marked <span className="text-warn">manual</span> have no public API and are entered by hand or pulled from a sheet.
        </p>
      </footer>
    </main>
  );
}
