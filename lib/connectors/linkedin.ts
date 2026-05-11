import type { Connector } from "../types";
import { makeSeries, makeDailySeries, lastValue, deltaPct, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (the hard one):
//   LinkedIn Marketing Developer Platform — requires an approved app with the
//   r_organization_social / rw_organization_admin scopes and the user being an
//   admin of the Company Page.
//   GET /organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity={urn}
//   GET /organizationPageStatistics?q=organization&organization={urn}
//   Personal-profile metrics are NOT available via API — only Company Pages.
//   Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_URN in .env to go live.

export const linkedinConnector: Connector = {
  id: "linkedin",
  name: "LinkedIn (Page)",
  category: "Social",
  async fetch() {
    const live = env("LINKEDIN_ACCESS_TOKEN") && env("LINKEDIN_ORG_URN");

    const followers = makeSeries({ seed: "li.followers", days: MOCK_DAYS, start: 5600, dailyGrowth: 0.006, noise: 0.01 });
    const impressions = makeDailySeries({ seed: "li.impr", days: MOCK_DAYS, base: 4100, noise: 0.45 });
    const engagement = makeDailySeries({ seed: "li.eng", days: MOCK_DAYS, base: 260, noise: 0.5 });

    return buildResult({
      id: "linkedin",
      name: "LinkedIn (Page)",
      category: "Social",
      status: live ? "live" : "mock",
      setupHint: "LinkedIn Marketing API (approved app, Page admin). Personal profiles have no API.",
      metrics: [
        { key: "followers", label: "Page followers", value: lastValue(followers), unit: "count", series: followers, deltaPct: deltaPct(followers, 7) },
        { key: "impressions_7d", label: "Impressions (7d)", value: sumLast(impressions, 7), unit: "count", series: impressions, deltaPct: windowDeltaPct(impressions, 7) },
        { key: "engagement_7d", label: "Reactions+comments (7d)", value: sumLast(engagement, 7), unit: "count", series: engagement, deltaPct: windowDeltaPct(engagement, 7) },
      ],
    });
  },
};
