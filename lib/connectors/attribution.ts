import type { Connector, Metric } from "../types";
import { sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult } from "./helpers";
import { TRACKED_LINKS } from "../links/config";
import { seededSeries, liveClickCount } from "../links/store";

// This connector is FUNCTIONAL today, not a stub: every tracked link in
// lib/links/config.ts is served at /go/{slug}. The route counts the click and
// redirects with utm_source=podcast etc. appended, so the destination's
// analytics attribute the visit — no UTM-building by anyone, ever.
// Say the short link on air; the click shows up here on the next refresh.
//
// Demo caveat: history is seeded with sample data and live clicks are held
// in memory (they reset on server restart). For production, persist clicks
// to SQLite/Postgres/Vercel KV in lib/links/store.ts — one small swap.

export const attributionConnector: Connector = {
  id: "attribution",
  name: "CTA Links (/go/…)",
  category: "Attribution",
  async fetch() {
    const perLink = TRACKED_LINKS.map((link) => {
      const series = seededSeries(link.slug, MOCK_DAYS);
      const clicks30 = sumLast(series, 30) + liveClickCount(link.slug);
      return { link, series, clicks30 };
    });

    const total30 = perLink.reduce((a, l) => a + l.clicks30, 0);
    const top = [...perLink].sort((a, b) => b.clicks30 - a.clicks30)[0];

    const metrics: Metric[] = [
      { key: "clicks_30d", label: "CTA clicks (30d)", value: total30, unit: "count", deltaPct: top ? windowDeltaPct(top.series, 30) : undefined, note: "All /go/ links combined" },
      ...perLink.map(({ link, series, clicks30 }) => ({
        key: `link_${link.slug}`,
        label: `/go/${link.slug} (30d)`,
        value: clicks30,
        unit: "count" as const,
        series,
        note: `${link.label} → ${link.destination}`,
      })),
    ];

    return buildResult({
      id: "attribution",
      name: "CTA Links (/go/…)",
      category: "Attribution",
      status: "mock",
      setupHint:
        "Works now: /go/{slug} counts the click and redirects with UTMs auto-appended (try /go/freebie). Edit links in lib/links/config.ts; persist clicks to a small DB for production. Demo history is seeded; real clicks add on top.",
      metrics,
    });
  },
};
