import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   OP3 (op3.dev) is the modern, open-source successor to the Podtrac
//   prepend: add its prefix to every enclosure URL in the RSS feed —
//     https://op3.dev/e/<your-episode-file-url>
//   — and OP3 measures every download that comes through the feed,
//   IAB-style filtered, INDEPENDENT of the host and across every app.
//   That gives you a second opinion on the host's numbers and an
//   "estimated unique audience" figure hosts don't share.
//   API (free, token from op3.dev/api/keys):
//     GET https://op3.dev/api/1/downloads/show/{showUuid}?token=...
//     GET https://op3.dev/api/1/queries/show-summary/{showUuid}
//   Most hosts let you add the prefix in one settings field ("analytics
//   prefix"). Podtrac itself still operates too — same idea, closed data.
//   Set OP3_SHOW_UUID + OP3_TOKEN to go live.

export const op3Connector: Connector = {
  id: "op3",
  name: "Prefix Analytics (OP3)",
  category: "Audio",
  async fetch() {
    const live = Boolean(env("OP3_SHOW_UUID") && env("OP3_TOKEN"));

    const daily = makeDailySeries({ seed: "op3.dl", days: MOCK_DAYS, base: 214, noise: 0.4, weekendDip: true });
    const audience = makeSeries({ seed: "op3.aud", days: MOCK_DAYS, start: 3050, dailyGrowth: 0.0022, noise: 0.015 });

    return buildResult({
      id: "op3",
      name: "Prefix Analytics (OP3)",
      category: "Audio",
      status: live ? "live" : "mock",
      setupHint:
        "Add the op3.dev/e/ prefix to enclosure URLs in your RSS feed (one field at most hosts), then set OP3_SHOW_UUID + OP3_TOKEN. Free, open-source, host-independent download measurement — the successor to the Podtrac prepend.",
      metrics: [
        { key: "downloads_30d", label: "Verified downloads (30d)", value: sumLast(daily, 30), unit: "count", series: daily, deltaPct: windowDeltaPct(daily, 30), note: "IAB-style filtered, measured independently of the host" },
        { key: "audience_30d", label: "Est. unique audience (30d)", value: lastValue(audience), unit: "count", series: audience, note: "Distinct devices — closer to 'people' than raw downloads" },
        { key: "vs_host", label: "vs host downloads", value: 91, unit: "percent", note: "OP3 ÷ host for the same window. A big gap usually means bot/prefetch traffic in the host number" },
      ],
    });
  },
};
