import type { DashboardSnapshot } from "@/lib/types";
import { reachMix, listeningApps } from "@/lib/reach";
import { formatNumber } from "@/lib/format";

/**
 * "Where does our reach actually come from?" — a stacked bar of the last
 * 30 days (audio downloads / YouTube / clips), plus the listening-app split
 * that shows why Apple+Spotify dashboards alone under-count the audience.
 */
export function ReachMix({ snap }: { snap: DashboardSnapshot }) {
  const slices = reachMix(snap).filter((s) => s.value > 0);
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const apps = listeningApps(snap);

  return (
    <section className="rounded-lg border border-line bg-panel p-3 shadow-sm">
      <h3 className="text-sm font-semibold text-ink">Where your reach comes from (30d)</h3>

      <div className="mt-2.5 flex h-4 w-full overflow-hidden rounded-full bg-panel2">
        {slices.map((s) => (
          <div key={s.key} className={s.cls} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value.toLocaleString()}`} />
        ))}
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {slices.map((s) => (
          <li key={s.key} className="flex items-baseline justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 text-muted">
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.cls}`} />
              <span className="truncate" title={s.note}>{s.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink">
              {formatNumber(s.value)}
              <span className="ml-1.5 text-muted">{Math.round((s.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>

      {apps.length > 0 && (
        <div className="mt-3 border-t border-line pt-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Listening apps (audio downloads)</p>
          <ul className="mt-1.5 space-y-1">
            {apps.map((a) => (
              <li key={a.label} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate text-muted">{a.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel2">
                  <span className="block h-full rounded-full bg-accent/70" style={{ width: `${a.pct}%` }} />
                </span>
                <span className="w-9 shrink-0 text-right tabular-nums text-ink">{a.pct}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-snug text-muted">
            Apple + Spotify dashboards only see their own slice — here that&apos;s{" "}
            {Math.round(apps.filter((a) => a.label === "Apple Podcasts" || a.label === "Spotify").reduce((x, a) => x + a.pct, 0))}
            % of listening. The rest is invisible without the RSS + prefix numbers above.
          </p>
        </div>
      )}
    </section>
  );
}
