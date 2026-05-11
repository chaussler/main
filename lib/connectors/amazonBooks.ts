import type { Connector } from "../types";
import { makeDailySeries, lastValue, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (limited — Amazon has no clean "book sales" API for authors):
//   Options, roughly best to worst:
//   1. Manual: download the KDP "Royalties" report (CSV/XLSX) and upload it
//      here weekly. Most reliable.
//   2. Amazon Advertising API: gives sales *attributed to ads* only — partial.
//   3. SP-API (Selling Partner API): only if books are sold via Seller Central,
//      not standard KDP. Heavy onboarding.
//   4. Third parties (Bookreport, ReaderScout, Book Beam) that scrape KDP.
//   Default status here is "manual". Set AMAZON_BOOKS_SOURCE if you wire one.

export const amazonBooksConnector: Connector = {
  id: "amazon-books",
  name: "Book Sales (Amazon KDP)",
  category: "Books",
  async fetch() {
    const live = Boolean(env("AMAZON_BOOKS_SOURCE"));

    const units = makeDailySeries({ seed: "kdp.units", days: MOCK_DAYS, base: 11, noise: 0.6 });
    const kenp = makeDailySeries({ seed: "kdp.kenp", days: MOCK_DAYS, base: 1800, noise: 0.5 }); // Kindle pages read
    const royalties = makeDailySeries({ seed: "kdp.roy", days: MOCK_DAYS, base: 11 * 3.6 + 1800 * 0.0045, noise: 0.55, integer: false });

    return buildResult({
      id: "amazon-books",
      name: "Book Sales (Amazon KDP)",
      category: "Books",
      status: live ? "live" : "manual",
      setupHint: "No author sales API — upload the KDP royalties report weekly, or use a tool like Bookreport.",
      metrics: [
        { key: "units_7d", label: "Books sold (7d)", value: sumLast(units, 7), unit: "count", series: units, deltaPct: windowDeltaPct(units, 7) },
        { key: "royalties_7d", label: "Royalties (7d)", value: Math.round(sumLast(royalties, 7)), unit: "currency", series: royalties, deltaPct: windowDeltaPct(royalties, 7) },
        { key: "kenp_7d", label: "KU pages read (7d)", value: sumLast(kenp, 7), unit: "count", series: kenp, deltaPct: windowDeltaPct(kenp, 7) },
      ],
    });
  },
};
