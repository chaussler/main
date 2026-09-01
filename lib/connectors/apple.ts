import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   Apple Podcasts Connect (podcastsconnect.apple.com) has the richest
//   BEHAVIOR data — plays, listeners, engaged listeners, followers, and
//   average consumption — but no public analytics API. Two options:
//     1. Weekly CSV export from Podcasts Connect → Analytics (Export as CSV);
//        drop it somewhere the dashboard can read (set APPLE_STATS_SOURCE to
//        a sheet/CSV URL and parse it here).
//     2. Some hosts (e.g. Buzzsprout, Transistor) sync Apple + Spotify
//        listener stats into their own API via the platforms' delegated
//        integrations — if yours does, read it from the host connector's
//        API instead and mark this card live.
//   For most shows Apple is 40-60% of listening, so this sample of true
//   behavior (how MUCH people listen) is worth the weekly export.

export const appleConnector: Connector = {
  id: "apple",
  name: "Apple Podcasts",
  category: "Audio",
  async fetch() {
    const source = env("APPLE_STATS_SOURCE");

    const plays = makeDailySeries({ seed: "apple.plays", days: MOCK_DAYS, base: 118, noise: 0.35, weekendDip: true });
    const followers = makeSeries({ seed: "apple.followers", days: MOCK_DAYS, start: 2380, dailyGrowth: 0.0021, noise: 0.008 });
    const consumption = makeSeries({ seed: "apple.consumption", days: MOCK_DAYS, start: 71, dailyGrowth: 0, noise: 0.04, integer: false, floor: 30 });

    return buildResult({
      id: "apple",
      name: "Apple Podcasts",
      category: "Audio",
      status: source ? "manual" : "mock",
      setupHint:
        "No public analytics API — weekly CSV export from Podcasts Connect (set APPLE_STATS_SOURCE to where you drop it), or via your host's Apple integration. Worth it: Apple is typically 40-60% of listening and reports true behavior (engaged listeners, consumption).",
      metrics: [
        { key: "plays_30d", label: "Plays (30d)", value: sumLast(plays, 30), unit: "count", series: plays, deltaPct: windowDeltaPct(plays, 30), note: "A play = someone actually pressed play, unlike a download" },
        { key: "listeners_30d", label: "Listeners (30d)", value: Math.round(sumLast(plays, 30) * 0.62), unit: "count", note: "Unique devices that played" },
        { key: "engaged_30d", label: "Engaged listeners (30d)", value: Math.round(sumLast(plays, 30) * 0.38), unit: "count", note: "Played >20 min or >40% of the episode" },
        { key: "followers", label: "Followers", value: lastValue(followers), unit: "count", series: followers, deltaPct: deltaPct(followers, 30) },
        { key: "consumption", label: "Avg consumption", value: lastValue(consumption), unit: "percent", series: consumption, note: "How much of an episode the average listener finishes" },
      ],
    });
  },
};
