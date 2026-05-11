import type { Connector } from "../types";
import { buildResult, env, MOCK_DAYS } from "./helpers";
import { makeDailySeries, sumLast } from "../mock";

// There is no "platform" for speaking engagements — this is manual entry.
// Recommended: a small form in the dashboard (or a Google Sheet / Airtable /
// Notion DB) with columns: date, event, type (keynote|workshop|panel|podcast),
// audience_size, fee, status (booked|held|invoiced|paid). Then read it here.
//
// For the scaffold we synthesize a few upcoming/past engagements + a monthly
// fee total so the section isn't empty.

interface Engagement {
  date: string;
  event: string;
  type: string;
  audience: number;
  fee: number;
  status: "booked" | "held" | "paid";
}

function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const SAMPLE: Engagement[] = [
  { date: isoDay(-21), event: "SaaS Growth Summit — Keynote", type: "keynote", audience: 600, fee: 8000, status: "paid" },
  { date: isoDay(-7), event: "FounderOS Workshop", type: "workshop", audience: 45, fee: 3500, status: "held" },
  { date: isoDay(9), event: "B2B Marketing Live — Panel", type: "panel", audience: 300, fee: 1500, status: "booked" },
  { date: isoDay(23), event: "Corporate Lunch & Learn — Acme Co.", type: "workshop", audience: 80, fee: 5000, status: "booked" },
  { date: isoDay(41), event: "Industry Podcast Tour (3 shows)", type: "podcast", audience: 0, fee: 0, status: "booked" },
];

export const speakingConnector: Connector = {
  id: "speaking",
  name: "Speaking / Lectures",
  category: "Speaking",
  async fetch() {
    const live = Boolean(env("SPEAKING_SOURCE")); // e.g. Airtable/Notion/Sheet id
    const today = isoDay(0);

    const upcoming = SAMPLE.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    const past90 = SAMPLE.filter((e) => e.date < today);
    const next = upcoming[0];

    // booked fee value in the pipeline (not yet paid)
    const pipelineFees = SAMPLE.filter((e) => e.status === "booked").reduce((a, e) => a + e.fee, 0);
    const paidFees90 = past90.filter((e) => e.status === "paid").reduce((a, e) => a + e.fee, 0);

    // a tiny synthetic "inbound speaking requests" series so there's a trend line
    const requests = makeDailySeries({ seed: "spk.req", days: MOCK_DAYS, base: 0.4, noise: 1.2, weekendDip: true });

    return buildResult({
      id: "speaking",
      name: "Speaking / Lectures",
      category: "Speaking",
      status: live ? "live" : "manual",
      setupHint: "No API — enter engagements in a form/sheet (date, event, audience, fee, status).",
      metrics: [
        { key: "upcoming", label: "Upcoming engagements", value: upcoming.length, unit: "count" },
        { key: "next_event", label: next ? `Next: ${next.event}` : "Next engagement", value: next ? Math.max(0, Math.round((Date.parse(next.date) - Date.parse(today)) / 86400000)) : 0, unit: "duration", note: next ? `${next.date} · ${next.type} · ${next.audience || "—"} attendees` : "none on the calendar" },
        { key: "pipeline_fees", label: "Booked fees (pipeline)", value: pipelineFees, unit: "currency" },
        { key: "paid_fees_90d", label: "Speaking revenue (90d)", value: paidFees90, unit: "currency" },
        { key: "requests_7d", label: "Inbound requests (7d)", value: sumLast(requests, 7), unit: "count", series: requests },
      ],
    });
  },
};

export const SAMPLE_ENGAGEMENTS = SAMPLE;
