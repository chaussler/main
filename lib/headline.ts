import type { DashboardSnapshot, Metric } from "./types";

export interface HeadlineStat {
  key: string;
  label: string;
  value: number;
  unit: "currency" | "count";
  deltaPct?: number;
  hint?: string;
}

function findMetric(snap: DashboardSnapshot, connectorId: string, metricKey: string): Metric | undefined {
  const c = snap.connectors.find((c) => c.id === connectorId);
  return c?.metrics.find((m) => m.key === metricKey);
}

function sumMetrics(metrics: (Metric | undefined)[]): { value: number; deltaPct?: number } {
  const present = metrics.filter(Boolean) as Metric[];
  const value = present.reduce((a, m) => a + (m.value || 0), 0);
  // weighted-ish delta: weight each metric's delta by its value
  const withDelta = present.filter((m) => m.deltaPct !== undefined && m.value);
  if (!withDelta.length) return { value };
  const totalWeight = withDelta.reduce((a, m) => a + m.value, 0);
  const deltaPct = withDelta.reduce((a, m) => a + (m.deltaPct as number) * m.value, 0) / (totalWeight || 1);
  return { value, deltaPct: Math.round(deltaPct * 10) / 10 };
}

/** The big tiles at the top of the dashboard. Robust to missing connectors. */
export function computeHeadline(snap: DashboardSnapshot): HeadlineStat[] {
  const revenue = sumMetrics([
    findMetric(snap, "stripe", "gross_7d"),
    findMetric(snap, "course-sales", "revenue_7d"),
    findMetric(snap, "amazon-books", "royalties_7d"),
  ]);

  const audience = sumMetrics([
    findMetric(snap, "instagram", "followers"),
    findMetric(snap, "facebook", "fans"),
    findMetric(snap, "linkedin", "followers"),
    findMetric(snap, "email-list", "subscribers"),
    findMetric(snap, "linkedin-newsletter", "subscribers"),
  ]);

  const newSubs = sumMetrics([
    findMetric(snap, "email-list", "net_new_7d"),
  ]);

  const mrr = findMetric(snap, "stripe", "mrr");
  const replies = findMetric(snap, "smartlead", "positive_7d");
  const meetings = findMetric(snap, "smartlead", "meetings_7d");
  const upcomingTalks = findMetric(snap, "speaking", "upcoming");

  const stats: HeadlineStat[] = [
    { key: "revenue_7d", label: "Revenue (7d)", value: revenue.value, unit: "currency", deltaPct: revenue.deltaPct, hint: "Stripe + course + book royalties" },
    { key: "mrr", label: "MRR", value: mrr?.value ?? 0, unit: "currency", deltaPct: mrr?.deltaPct, hint: "Stripe subscriptions" },
    { key: "audience", label: "Total audience", value: audience.value, unit: "count", deltaPct: audience.deltaPct, hint: "Followers + email + newsletter" },
    { key: "new_subs_7d", label: "New email subs (7d)", value: newSubs.value, unit: "count", deltaPct: newSubs.deltaPct },
    { key: "positive_replies_7d", label: "Positive replies (7d)", value: replies?.value ?? 0, unit: "count", deltaPct: replies?.deltaPct, hint: "Cold email" },
    { key: "pipeline", label: "Meetings + talks ahead", value: (meetings?.value ?? 0) + (upcomingTalks?.value ?? 0), unit: "count", hint: "Booked meetings (7d) + upcoming speaking" },
  ];
  return stats;
}
