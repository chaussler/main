import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";
import { mockEpisodes } from "../podcast/episodes";
import { medianDownloads7d } from "../podcast/benchmarks";

// LIVE WIRING (set HOST_PROVIDER + HOST_API_KEY; add HOST_SHOW_ID if needed):
//   Every major host exposes downloads over its API — this card only needs
//   "downloads per day" plus the listening-app breakdown:
//   - Buzzsprout:  GET https://www.buzzsprout.com/api/{podcast_id}/episodes.json
//                  (per-episode total_plays; daily stats via /stats endpoints)
//   - Transistor:  GET https://api.transistor.fm/v1/analytics/{show_id}
//                  (downloads by day, header x-api-key)
//   - Captivate:   GET https://api.captivate.fm/shows/{show_id}/analytics
//   - Podbean:     GET https://api.podbean.com/v1/podcastStats/stats
//   - Libsyn:      Libsyn API 3 /stats endpoints
//   - RSS.com:     GET /v1/podcasts/{id}/analytics
//   Map the response into the same daily series below; the listening-app
//   split (Apple/Spotify/other %) comes from the host's "apps" report and
//   feeds the "Where they listen" panel.

const APP_SHARES = [
  // Typical client split: 40-60% Apple, 4-20% Spotify, rest scattered.
  { key: "share_apple", label: "Apple Podcasts share", value: 54 },
  { key: "share_spotify", label: "Spotify share", value: 14 },
  { key: "share_overcast", label: "Overcast share", value: 9 },
  { key: "share_browser", label: "Web / embed share", value: 8 },
  { key: "share_other", label: "Other apps share", value: 15 },
];

export const hostConnector: Connector = {
  id: "host",
  name: "Podcast Host (RSS)",
  category: "Audio",
  async fetch() {
    const live = Boolean(env("HOST_PROVIDER") && env("HOST_API_KEY"));

    const daily = makeDailySeries({ seed: "host.dl", days: MOCK_DAYS, base: 235, noise: 0.4, weekendDip: true });
    const allTime = makeSeries({ seed: "host.all", days: MOCK_DAYS, start: 182_000, dailyGrowth: 0.0013, noise: 0.001 });

    return buildResult({
      id: "host",
      name: "Podcast Host (RSS)",
      category: "Audio",
      status: live ? "live" : "mock",
      setupHint:
        "Set HOST_PROVIDER (buzzsprout|transistor|captivate|podbean|libsyn|rsscom) + HOST_API_KEY. Downloads = a file reached a device, NOT a confirmed listen — treat as the upper bound of audio reach.",
      metrics: [
        { key: "downloads_30d", label: "Downloads (30d)", value: sumLast(daily, 30), unit: "count", series: daily, deltaPct: windowDeltaPct(daily, 30) },
        { key: "downloads_7d", label: "Downloads (7d)", value: sumLast(daily, 7), unit: "count", deltaPct: windowDeltaPct(daily, 7) },
        { key: "downloads_all", label: "All-time downloads", value: lastValue(allTime), unit: "count" },
        { key: "per_episode", label: "Typical episode (first 7d)", value: medianDownloads7d(mockEpisodes().slice(0, 8).map((e) => e.downloads7d)), unit: "count", note: "Median first-week downloads of recent episodes — the industry benchmark number" },
        ...APP_SHARES.map((s) => ({ ...s, unit: "percent" as const, note: "From the host's listening-apps report" })),
      ],
    });
  },
};
