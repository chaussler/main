import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   Spotify for Creators (creators.spotify.com) shows streams, listeners,
//   followers and audience demographics — but has NO public analytics API.
//   Options, best first:
//     1. Your host's Spotify integration: several hosts pull Spotify listener
//        stats through Spotify's partner program and expose them in their own
//        API — check the host connector first.
//     2. Weekly manual entry / CSV from the Spotify for Creators dashboard
//        (set SPOTIFY_STATS_SOURCE to the sheet/CSV you keep it in).
//   Spotify is usually 4-20% of listening for indie business shows — a small
//   but real slice, and the demographic data (age/gender) exists nowhere else.

export const spotifyConnector: Connector = {
  id: "spotify",
  name: "Spotify",
  category: "Audio",
  async fetch() {
    const source = env("SPOTIFY_STATS_SOURCE");

    const streams = makeDailySeries({ seed: "spotify.streams", days: MOCK_DAYS, base: 34, noise: 0.4, weekendDip: false });
    const followers = makeSeries({ seed: "spotify.followers", days: MOCK_DAYS, start: 660, dailyGrowth: 0.0024, noise: 0.01 });
    const listenPct = makeSeries({ seed: "spotify.listen", days: MOCK_DAYS, start: 64, dailyGrowth: 0, noise: 0.05, integer: false, floor: 25 });

    return buildResult({
      id: "spotify",
      name: "Spotify",
      category: "Audio",
      status: source ? "manual" : "mock",
      setupHint:
        "No public analytics API. Use your host's Spotify integration if it has one, or log the weekly numbers from Spotify for Creators (set SPOTIFY_STATS_SOURCE). Typically 4-20% of listening — small slice, but true behavior + the only demographic data.",
      metrics: [
        { key: "streams_30d", label: "Streams (30d)", value: sumLast(streams, 30), unit: "count", series: streams, deltaPct: windowDeltaPct(streams, 30) },
        { key: "listeners_30d", label: "Listeners (30d)", value: Math.round(sumLast(streams, 30) * 0.58), unit: "count" },
        { key: "followers", label: "Followers", value: lastValue(followers), unit: "count", series: followers, deltaPct: deltaPct(followers, 30) },
        { key: "listen_pct", label: "Avg listen-through", value: lastValue(listenPct), unit: "percent", series: listenPct },
      ],
    });
  },
};
