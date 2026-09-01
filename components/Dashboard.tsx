"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardSnapshot } from "@/lib/types";
import { computeHeadline } from "@/lib/headline";
import { ConnectorCard } from "./ConnectorCard";
import { ReachMix } from "./ReachMix";
import { BenchmarkPanel } from "./BenchmarkPanel";
import { EpisodeTable } from "./EpisodeTable";
import { formatNumber, formatDelta, deltaTone, timeAgo } from "@/lib/format";

const REFRESH_MS = 60_000;
const SHOW_NAME = process.env.NEXT_PUBLIC_SHOW_NAME || "Your Podcast";

export function Dashboard({ initial }: { initial: DashboardSnapshot }) {
  const [snap, setSnap] = useState<DashboardSnapshot>(initial);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0); // forces "x ago" labels to re-render
  const [showHints, setShowHints] = useState(false);

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
  // connectors arrive already sorted by category from the API

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-accent pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-lg" aria-hidden>
            🎙️
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-ink">{SHOW_NAME} — Reach Dashboard</h1>
            <p className="text-xs text-muted">
              Every platform&apos;s slice of the audience in one place · updated {timeAgo(snap.generatedAt)}
              <span className="sr-only">{tick}</span>
              {" · "}
              {liveCount}/{snap.connectors.length} sources live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHints((v) => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showHints ? "border-accent bg-accent text-white" : "border-line bg-panel text-muted hover:text-ink"
            }`}
          >
            {showHints ? "Hide wiring notes" : "Wiring notes"}
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-muted hover:text-ink disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* Headline tiles */}
      <section className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {headline.map((h) => {
          const tone = deltaTone(h.deltaPct, true);
          const delta = formatDelta(h.deltaPct);
          const deltaCls = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
          return (
            <div key={h.key} className="rounded-lg border border-line bg-panel px-3 py-2.5 shadow-sm" title={h.hint}>
              <div className="text-[10px] uppercase tracking-wide text-muted">{h.label}</div>
              <div className="mt-0.5 text-xl font-bold tabular-nums text-ink">
                {h.displayValue ?? formatNumber(h.value)}
              </div>
              {delta && <div className={`text-[11px] font-medium ${deltaCls}`}>{delta}</div>}
            </div>
          );
        })}
      </section>

      {/* Reach mix + benchmark, then per-episode performance */}
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ReachMix snap={snap} />
        <BenchmarkPanel snap={snap} />
      </section>
      <section className="mb-4">
        <EpisodeTable episodes={snap.episodes} />
      </section>

      {/* All sources in one dense grid (cards are already grouped by category order) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {snap.connectors.map((c) => (
          <ConnectorCard key={c.id} connector={c} showHint={showHints} />
        ))}
      </div>

      <footer className="mt-8 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
        <p>
          <span className="font-medium text-good">live</span> = real API · <span className="font-medium text-accent">demo data</span> = sample numbers (add keys to{" "}
          <code className="rounded bg-panel2 px-1">.env</code>) · <span className="font-medium text-warn">manual</span> = platform has no public API (Apple, Spotify), entered weekly or via your host&apos;s integration.
          {" "}A <em>download</em> is a file reaching a device; a <em>play</em> is a person pressing play — this board keeps the two honest and separate.
          {" "}Toggle “Wiring notes” to see how each source connects.
        </p>
      </footer>
    </main>
  );
}
