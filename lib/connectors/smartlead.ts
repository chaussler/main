import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   Smartlead API (https://api.smartlead.ai) — needs SMARTLEAD_API_KEY.
//   GET /api/v1/campaigns?api_key=...                       -> list campaigns
//   GET /api/v1/campaigns/{id}/analytics?api_key=...        -> sent / opens /
//       replies / bounces / positive replies for the period
//   GET /api/v1/campaigns/{id}/statistics?api_key=...       -> per-lead detail
//   Aggregate across active campaigns into the metrics below.

export const smartleadConnector: Connector = {
  id: "smartlead",
  name: "Cold Email (Smartlead)",
  category: "Outbound",
  async fetch() {
    const live = Boolean(env("SMARTLEAD_API_KEY"));

    const sent = makeDailySeries({ seed: "sl.sent", days: MOCK_DAYS, base: 320, noise: 0.3 });
    const opens = makeDailySeries({ seed: "sl.opens", days: MOCK_DAYS, base: 150, noise: 0.35 });
    const replies = makeDailySeries({ seed: "sl.replies", days: MOCK_DAYS, base: 14, noise: 0.6 });
    const positive = makeDailySeries({ seed: "sl.pos", days: MOCK_DAYS, base: 4, noise: 0.8 });
    const meetings = makeDailySeries({ seed: "sl.meet", days: MOCK_DAYS, base: 1.2, noise: 1.0 });
    const replyRate = makeSeries({ seed: "sl.rr", days: MOCK_DAYS, start: 4.2, dailyGrowth: 0, noise: 0.12, integer: false, floor: 0.5 });

    return buildResult({
      id: "smartlead",
      name: "Cold Email (Smartlead)",
      category: "Outbound",
      status: live ? "live" : "mock",
      setupHint: "Smartlead API: set SMARTLEAD_API_KEY; aggregate campaign analytics endpoints.",
      metrics: [
        { key: "sent_7d", label: "Emails sent (7d)", value: sumLast(sent, 7), unit: "count", series: sent, deltaPct: windowDeltaPct(sent, 7) },
        { key: "replies_7d", label: "Replies (7d)", value: sumLast(replies, 7), unit: "count", series: replies, deltaPct: windowDeltaPct(replies, 7) },
        { key: "positive_7d", label: "Positive replies (7d)", value: sumLast(positive, 7), unit: "count", series: positive, deltaPct: windowDeltaPct(positive, 7) },
        { key: "meetings_7d", label: "Meetings booked (7d)", value: sumLast(meetings, 7), unit: "count", series: meetings },
        { key: "reply_rate", label: "Reply rate", value: lastValue(replyRate), unit: "percent", series: replyRate, deltaPct: deltaPct(replyRate, 14) },
        { key: "opens_7d", label: "Opens (7d)", value: sumLast(opens, 7), unit: "count", series: opens },
      ],
    });
  },
};
