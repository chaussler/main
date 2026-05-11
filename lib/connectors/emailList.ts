import type { Connector } from "../types";
import { makeSeries, makeDailySeries, lastValue, deltaPct, sumLast } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (depends on the ESP — set EMAIL_PROVIDER + its API key):
//   - Mailchimp:    GET /3.0/lists/{id}  -> stats.member_count, ...
//                   GET /3.0/reports     -> opens/clicks per campaign
//   - ConvertKit/Kit: GET /v3/subscribers (total_subscribers), /v3/broadcasts/{id}/stats
//   - Beehiiv:      GET /v2/publications/{id} (stats), /v2/posts/{id}/stats
//   Map "active subscribers", "net new (7d)", "avg open rate", "avg click rate".

export const emailListConnector: Connector = {
  id: "email-list",
  name: "Email List",
  category: "Email",
  async fetch() {
    const provider = env("EMAIL_PROVIDER");
    const key =
      env("MAILCHIMP_API_KEY") || env("CONVERTKIT_API_KEY") || env("BEEHIIV_API_KEY");
    const live = Boolean(provider && key);

    const subscribers = makeSeries({ seed: "email.subs", days: MOCK_DAYS, start: 14800, dailyGrowth: 0.0035, noise: 0.006 });
    const netNew = makeDailySeries({ seed: "email.new", days: MOCK_DAYS, base: 55, noise: 0.5, weekendDip: false });
    const openRate = makeSeries({ seed: "email.open", days: MOCK_DAYS, start: 38, dailyGrowth: 0, noise: 0.06, integer: false, floor: 5 });
    const clickRate = makeSeries({ seed: "email.click", days: MOCK_DAYS, start: 3.4, dailyGrowth: 0, noise: 0.1, integer: false, floor: 0.2 });

    return buildResult({
      id: "email-list",
      name: "Email List",
      category: "Email",
      status: live ? "live" : "mock",
      setupHint: "Set EMAIL_PROVIDER (mailchimp|convertkit|beehiiv) + that provider's API key.",
      metrics: [
        { key: "subscribers", label: "Subscribers", value: lastValue(subscribers), unit: "count", series: subscribers, deltaPct: deltaPct(subscribers, 7) },
        { key: "net_new_7d", label: "Net new (7d)", value: sumLast(netNew, 7), unit: "count", series: netNew },
        { key: "open_rate", label: "Avg open rate", value: lastValue(openRate), unit: "percent", series: openRate, deltaPct: deltaPct(openRate, 14) },
        { key: "click_rate", label: "Avg click rate", value: lastValue(clickRate), unit: "percent", series: clickRate, deltaPct: deltaPct(clickRate, 14) },
      ],
    });
  },
};
