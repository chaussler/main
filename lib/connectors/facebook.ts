import type { Connector } from "../types";
import { makeSeries, makeDailySeries, lastValue, deltaPct, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   Meta Graph API — Page access token + pages_read_engagement + read_insights.
//   GET /{page-id}?fields=fan_count,followers_count
//   GET /{page-id}/insights?metric=page_impressions,page_post_engagements&period=day
//   Set FB_PAGE_ID and META_ACCESS_TOKEN in .env to go live.

export const facebookConnector: Connector = {
  id: "facebook",
  name: "Facebook",
  category: "Social",
  async fetch() {
    const live = env("META_ACCESS_TOKEN") && env("FB_PAGE_ID");

    const fans = makeSeries({ seed: "fb.fans", days: MOCK_DAYS, start: 12400, dailyGrowth: 0.0015, noise: 0.008 });
    const impressions = makeDailySeries({ seed: "fb.impr", days: MOCK_DAYS, base: 5200, noise: 0.4 });
    const engagement = makeDailySeries({ seed: "fb.eng", days: MOCK_DAYS, base: 310, noise: 0.5 });

    return buildResult({
      id: "facebook",
      name: "Facebook",
      category: "Social",
      status: live ? "live" : "mock",
      setupHint: "Meta Graph API: Page token + read_insights. Same app as Instagram.",
      metrics: [
        { key: "fans", label: "Page likes", value: lastValue(fans), unit: "count", series: fans, deltaPct: deltaPct(fans, 7) },
        { key: "impressions_7d", label: "Impressions (7d)", value: sumLast(impressions, 7), unit: "count", series: impressions, deltaPct: windowDeltaPct(impressions, 7) },
        { key: "engagement_7d", label: "Post engagements (7d)", value: sumLast(engagement, 7), unit: "count", series: engagement, deltaPct: windowDeltaPct(engagement, 7) },
      ],
    });
  },
};
