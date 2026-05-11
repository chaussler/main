import type { Connector } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING (the easy, high-value one — do this first):
//   Stripe API — set STRIPE_SECRET_KEY (sk_live_... or sk_test_...).
//   For a dashboard you mainly need:
//     - GET /v1/charges?created[gte]=... (or PaymentIntents) for gross volume
//     - GET /v1/balance_transactions for net (after fees)
//     - GET /v1/subscriptions + /v1/invoices for MRR / active subs
//     - GET /v1/refunds for refunds
//   Better: register a Stripe webhook (charge.succeeded, invoice.paid,
//   customer.subscription.*) so the dashboard updates in real time instead of
//   polling. Verify the signature with STRIPE_WEBHOOK_SECRET.
//
//   Recommended: `npm i stripe`, then
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//     const charges = await stripe.charges.list({ created: { gte: since }, limit: 100 });

export const stripeConnector: Connector = {
  id: "stripe",
  name: "Stripe (Payments)",
  category: "Payments",
  async fetch() {
    const live = Boolean(env("STRIPE_SECRET_KEY"));
    // TODO: when `live`, replace the mock block below with real Stripe calls.

    const grossDaily = makeDailySeries({ seed: "stripe.gross", days: MOCK_DAYS, base: 2100, noise: 0.45, weekendDip: false, integer: false });
    const txDaily = makeDailySeries({ seed: "stripe.tx", days: MOCK_DAYS, base: 9, noise: 0.5, weekendDip: false });
    const refundsDaily = makeDailySeries({ seed: "stripe.ref", days: MOCK_DAYS, base: 70, noise: 1.0, weekendDip: false, integer: false });
    const mrr = makeSeries({ seed: "stripe.mrr", days: MOCK_DAYS, start: 18500, dailyGrowth: 0.002, noise: 0.01, integer: false });
    const activeSubs = makeSeries({ seed: "stripe.subs", days: MOCK_DAYS, start: 240, dailyGrowth: 0.0018, noise: 0.01 });

    const gross7 = Math.round(sumLast(grossDaily, 7));
    const refunds7 = Math.round(sumLast(refundsDaily, 7));

    return buildResult({
      id: "stripe",
      name: "Stripe (Payments)",
      category: "Payments",
      status: live ? "live" : "mock",
      setupHint: "Set STRIPE_SECRET_KEY (+ STRIPE_WEBHOOK_SECRET for real-time). Easiest integration — wire this first.",
      metrics: [
        { key: "gross_7d", label: "Gross volume (7d)", value: gross7, unit: "currency", series: grossDaily, deltaPct: windowDeltaPct(grossDaily, 7) },
        { key: "net_7d", label: "Net after fees (7d)", value: Math.round(gross7 * 0.971), unit: "currency", note: "≈ gross − Stripe fees" },
        { key: "mrr", label: "MRR", value: Math.round(lastValue(mrr)), unit: "currency", series: mrr, deltaPct: deltaPct(mrr, 30) },
        { key: "active_subs", label: "Active subscriptions", value: lastValue(activeSubs), unit: "count", series: activeSubs, deltaPct: deltaPct(activeSubs, 30) },
        { key: "transactions_7d", label: "Successful charges (7d)", value: sumLast(txDaily, 7), unit: "count", series: txDaily, deltaPct: windowDeltaPct(txDaily, 7) },
        { key: "refunds_7d", label: "Refunds (7d)", value: refunds7, unit: "currency", series: refundsDaily, higherIsBetter: false },
      ],
    });
  },
};
