import type { Connector } from "../types";
import { makeSeries, makeDailySeries, lastValue, deltaPct, sumLast } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   LinkedIn does not expose newsletter-specific analytics via API. Options:
//   (a) treat the newsletter as articles on the Company Page and use
//       organizationPageStatistics, or
//   (b) manual weekly entry of "subscribers" and "article views" from the
//       LinkedIn newsletter dashboard.
//   This connector is therefore "manual" by default. If you later store the
//   numbers somewhere (a Google Sheet, a DB table), read them here.

export const linkedinNewsletterConnector: Connector = {
  id: "linkedin-newsletter",
  name: "LinkedIn Newsletter",
  category: "Newsletter",
  async fetch() {
    const live = env("LINKEDIN_NEWSLETTER_SOURCE"); // e.g. a Sheet ID / DB flag

    const subscribers = makeSeries({ seed: "lin.subs", days: MOCK_DAYS, start: 3100, dailyGrowth: 0.008, noise: 0.012 });
    const views = makeDailySeries({ seed: "lin.views", days: MOCK_DAYS, base: 900, noise: 0.6, weekendDip: false });

    return buildResult({
      id: "linkedin-newsletter",
      name: "LinkedIn Newsletter",
      category: "Newsletter",
      status: live ? "live" : "manual",
      setupHint: "No LinkedIn API for newsletters — enter subscribers / article views weekly, or pull from a sheet.",
      metrics: [
        { key: "subscribers", label: "Subscribers", value: lastValue(subscribers), unit: "count", series: subscribers, deltaPct: deltaPct(subscribers, 7) },
        { key: "views_7d", label: "Article views (7d)", value: sumLast(views, 7), unit: "count", series: views },
      ],
    });
  },
};
