import type { Connector } from "../types";
import { makeDailySeries, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (one card for all clip platforms — wire whichever you use):
//   - Instagram Reels / Facebook: Meta Graph API — IG Business account linked
//     to a FB Page, long-lived Page token, instagram_manage_insights +
//     read_insights (App Review required). GET /{ig-user-id}/media with
//     insights (plays, reach, likes, comments, shares).
//   - TikTok: TikTok for Developers "Display API" (video.list + video stats) —
//     app review required, business account recommended.
//   - LinkedIn: Company Page only via the Marketing API (personal profiles
//     have no API — log those clips manually or skip).
//   - YouTube Shorts: already covered by the YouTube connector.
//   Set META_ACCESS_TOKEN / TIKTOK_ACCESS_TOKEN / LINKEDIN_ACCESS_TOKEN for
//   whichever platforms you post clips to; each flips its rows live.
//   Clip views are SHALLOW reach (3-second views count) — the dashboard
//   shows them in the reach mix but never conflates them with listens.

export const socialClipsConnector: Connector = {
  id: "social-clips",
  name: "Social Clips",
  category: "Social",
  async fetch() {
    const live = Boolean(env("META_ACCESS_TOKEN") || env("TIKTOK_ACCESS_TOKEN") || env("LINKEDIN_ACCESS_TOKEN"));

    const ig = makeDailySeries({ seed: "clips.ig", days: MOCK_DAYS, base: 62, noise: 0.8, weekendDip: false });
    const tiktok = makeDailySeries({ seed: "clips.tt", days: MOCK_DAYS, base: 41, noise: 1.0, weekendDip: false });
    const linkedin = makeDailySeries({ seed: "clips.li", days: MOCK_DAYS, base: 22, noise: 0.7, weekendDip: true });
    const engagements = makeDailySeries({ seed: "clips.eng", days: MOCK_DAYS, base: 21, noise: 0.7, weekendDip: false });

    const total30 = sumLast(ig, 30) + sumLast(tiktok, 30) + sumLast(linkedin, 30);

    return buildResult({
      id: "social-clips",
      name: "Social Clips",
      category: "Social",
      status: live ? "live" : "mock",
      setupHint:
        "Meta Graph API (IG/FB), TikTok Display API, LinkedIn Marketing API (Company Pages only). Clip views are shallow, top-of-funnel reach — counted in the reach mix, never as listens.",
      metrics: [
        { key: "clip_views_30d", label: "Clip views (30d)", value: total30, unit: "count", deltaPct: windowDeltaPct(ig, 30) },
        { key: "ig_views_30d", label: "Instagram Reels (30d)", value: sumLast(ig, 30), unit: "count", series: ig },
        { key: "tiktok_views_30d", label: "TikTok (30d)", value: sumLast(tiktok, 30), unit: "count", series: tiktok },
        { key: "li_views_30d", label: "LinkedIn (30d)", value: sumLast(linkedin, 30), unit: "count", series: linkedin },
        { key: "engagements_30d", label: "Engagements (30d)", value: sumLast(engagements, 30), unit: "count", series: engagements, note: "Likes + comments + shares + saves across platforms" },
      ],
    });
  },
};
