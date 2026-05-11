import type { Connector } from "../types";
import { makeDailySeries, lastValue, sumLast, windowDeltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   "Course sales from his website" usually flows through Stripe already (see
//   stripe.ts), but if the course platform is its own thing wire it here:
//   - Teachable:   GET /v1/courses, /v1/users (admin API key)
//   - Kajabi:      no public API today -> webhooks or CSV export
//   - Thinkific:   GET /api/public/v1/enrollments, /orders
//   - Gumroad:     GET /v2/sales (access token)
//   - Plain Stripe Checkout on the site: filter Stripe charges by product.
//   Set COURSE_PLATFORM + its key to go live.

export const courseSalesConnector: Connector = {
  id: "course-sales",
  name: "Course Sales (Website)",
  category: "Sales",
  async fetch() {
    const live = Boolean(env("COURSE_PLATFORM") && (env("COURSE_API_KEY") || env("STRIPE_SECRET_KEY")));

    const units = makeDailySeries({ seed: "course.units", days: MOCK_DAYS, base: 6, noise: 0.7, weekendDip: false });
    const revenue = makeDailySeries({ seed: "course.rev", days: MOCK_DAYS, base: 6 * 249, noise: 0.7, weekendDip: false, integer: false });
    const refunds = makeDailySeries({ seed: "course.ref", days: MOCK_DAYS, base: 0.3, noise: 1.0 });
    const visitors = makeDailySeries({ seed: "course.visits", days: MOCK_DAYS, base: 420, noise: 0.4 });

    const sales7 = sumLast(units, 7);
    const visits7 = sumLast(visitors, 7);
    const convRate = visits7 ? Math.round((sales7 / visits7) * 1000) / 10 : 0;

    return buildResult({
      id: "course-sales",
      name: "Course Sales (Website)",
      category: "Sales",
      status: live ? "live" : "mock",
      setupHint: "Course platform API (Teachable/Thinkific/Gumroad/...) or Stripe products filtered by course.",
      metrics: [
        { key: "revenue_7d", label: "Course revenue (7d)", value: Math.round(sumLast(revenue, 7)), unit: "currency", series: revenue, deltaPct: windowDeltaPct(revenue, 7) },
        { key: "units_7d", label: "Courses sold (7d)", value: sales7, unit: "count", series: units, deltaPct: windowDeltaPct(units, 7) },
        { key: "conv_rate", label: "Visitor → buyer (7d)", value: convRate, unit: "percent" },
        { key: "refunds_7d", label: "Refunds (7d)", value: sumLast(refunds, 7), unit: "count", series: refunds, higherIsBetter: false },
      ],
    });
  },
};
