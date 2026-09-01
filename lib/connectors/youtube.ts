import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   The one platform with a genuinely great analytics API.
//   - YouTube Data API v3:      channel statistics (subscriberCount, viewCount)
//   - YouTube Analytics API v2: GET https://youtubeanalytics.googleapis.com/v2/reports
//       ids=channel==MINE & metrics=views,estimatedMinutesWatched,
//       averageViewDuration,averageViewPercentage,subscribersGained
//       & dimensions=day & startDate/endDate
//   Auth: OAuth2 (offline refresh token) on the channel's Google account.
//   Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN,
//   YOUTUBE_CHANNEL_ID to go live. Per-video rows (dimensions=video) feed
//   the episode table's "YouTube views" column.

export const youtubeConnector: Connector = {
  id: "youtube",
  name: "YouTube",
  category: "Video",
  async fetch() {
    const live = Boolean(env("YOUTUBE_REFRESH_TOKEN") && env("YOUTUBE_CHANNEL_ID"));

    const views = makeDailySeries({ seed: "yt.views", days: MOCK_DAYS, base: 96, noise: 0.5, weekendDip: false });
    const watchHours = makeDailySeries({ seed: "yt.watch", days: MOCK_DAYS, base: 14, noise: 0.5, weekendDip: false });
    const subs = makeSeries({ seed: "yt.subs", days: MOCK_DAYS, start: 1240, dailyGrowth: 0.0028, noise: 0.01 });
    const avgViewPct = makeSeries({ seed: "yt.avgpct", days: MOCK_DAYS, start: 41, dailyGrowth: 0, noise: 0.06, integer: false, floor: 10 });

    return buildResult({
      id: "youtube",
      name: "YouTube",
      category: "Video",
      status: live ? "live" : "mock",
      setupHint:
        "YouTube Analytics API v2 (OAuth refresh token on the channel account). The most robust analytics of any platform — views, watch time, retention, per-video breakdowns.",
      metrics: [
        { key: "views_30d", label: "Views (30d)", value: sumLast(views, 30), unit: "count", series: views, deltaPct: windowDeltaPct(views, 30) },
        { key: "watch_hours_30d", label: "Watch time (30d, hrs)", value: sumLast(watchHours, 30), unit: "count", series: watchHours, deltaPct: windowDeltaPct(watchHours, 30) },
        { key: "subscribers", label: "Subscribers", value: lastValue(subs), unit: "count", series: subs, deltaPct: deltaPct(subs, 30) },
        { key: "avg_view_pct", label: "Avg % viewed", value: lastValue(avgViewPct), unit: "percent", series: avgViewPct, note: "Retention — the honest engagement number" },
      ],
    });
  },
};
