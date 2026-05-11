import type { Connector } from "../types";
import { makeSeries, makeDailySeries, lastValue, deltaPct, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (when ready):
//   Meta Graph API — requires an Instagram Business/Creator account linked to a
//   Facebook Page, a Meta app, a long-lived Page access token, and the
//   instagram_basic + instagram_manage_insights permissions (App Review).
//   Endpoints: GET /{ig-user-id}?fields=followers_count,media_count
//              GET /{ig-user-id}/insights?metric=reach,profile_views&period=day
//   Put IG_BUSINESS_ID and META_ACCESS_TOKEN in .env to switch this to "live".

export const instagramConnector: Connector = {
  id: "instagram",
  name: "Instagram",
  category: "Social",
  async fetch() {
    const live = env("META_ACCESS_TOKEN") && env("IG_BUSINESS_ID");
    // TODO: when `live`, call the Graph API here and map the response.

    const followers = makeSeries({ seed: "ig.followers", days: MOCK_DAYS, start: 8200, dailyGrowth: 0.004, noise: 0.01 });
    const reach = makeDailySeries({ seed: "ig.reach", days: MOCK_DAYS, base: 3400, noise: 0.4 });
    const engagement = makeDailySeries({ seed: "ig.engagement", days: MOCK_DAYS, base: 220, noise: 0.45 });
    const posts = makeDailySeries({ seed: "ig.posts", days: MOCK_DAYS, base: 0.7, noise: 0.9 });

    return buildResult({
      id: "instagram",
      name: "Instagram",
      category: "Social",
      status: live ? "live" : "mock",
      setupHint: "Meta Graph API: IG Business account + Page token + instagram_manage_insights.",
      metrics: [
        { key: "followers", label: "Followers", value: lastValue(followers), unit: "count", series: followers, deltaPct: deltaPct(followers, 7) },
        { key: "reach_7d", label: "Reach (7d)", value: sumLast(reach, 7), unit: "count", series: reach, deltaPct: windowDeltaPct(reach, 7) },
        { key: "engagement_7d", label: "Engagements (7d)", value: sumLast(engagement, 7), unit: "count", series: engagement, deltaPct: windowDeltaPct(engagement, 7) },
        { key: "posts_7d", label: "Posts (7d)", value: sumLast(posts, 7), unit: "count", series: posts },
      ],
    });
  },
};
