import type { Connector, ConnectorResult, Metric } from "../types";
import { makeDailySeries, makeSeries, lastValue, sumLast, windowDeltaPct, deltaPct } from "../mock";
import { MOCK_DAYS, buildResult, env } from "./helpers";

// LIVE WIRING:
//   Smartlead API — base https://server.smartlead.ai/api/v1, auth via
//   `?api_key=...`. We list campaigns, then pull /analytics for each and sum.
//   The public analytics endpoint returns lifetime totals (not a daily series),
//   so the live card shows totals + rates rather than 7-day windows.
//   Endpoints used:
//     GET /campaigns
//     GET /campaigns/{id}/analytics
//   Docs: https://api.smartlead.ai/reference/  (field names below are defensive
//   — adjust if your account returns slightly different keys).
//   Set SMARTLEAD_API_KEY in .env to switch this connector to "live".

const SMARTLEAD_BASE = "https://server.smartlead.ai/api/v1";

interface SLCampaign {
  id: number | string;
  name?: string;
  status?: string;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

/** Pick the first present numeric value among several candidate keys. */
function pick(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) if (obj[k] != null) return num(obj[k]);
  return 0;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Smartlead ${new URL(url).pathname} → HTTP ${res.status}`);
  return res.json();
}

async function fetchLive(apiKey: string): Promise<ConnectorResult> {
  const q = `api_key=${encodeURIComponent(apiKey)}`;
  const campaignsRaw = await getJson(`${SMARTLEAD_BASE}/campaigns?${q}`);
  const campaigns: SLCampaign[] = Array.isArray(campaignsRaw)
    ? (campaignsRaw as SLCampaign[])
    : Array.isArray((campaignsRaw as { data?: unknown }).data)
      ? ((campaignsRaw as { data: SLCampaign[] }).data)
      : [];

  const isActive = (s?: string) => !s || /active|running|start|completed/i.test(s);
  const chosen = (campaigns.filter((c) => isActive(c.status)).length ? campaigns.filter((c) => isActive(c.status)) : campaigns).slice(0, 50);

  let sent = 0, opens = 0, clicks = 0, replies = 0, bounces = 0, positives = 0;
  for (const c of chosen) {
    try {
      const a = (await getJson(`${SMARTLEAD_BASE}/campaigns/${c.id}/analytics?${q}`)) as Record<string, unknown>;
      const row = (a && typeof a === "object" && "data" in a && a.data && typeof a.data === "object" ? (a.data as Record<string, unknown>) : a) as Record<string, unknown>;
      sent += pick(row, "sent_count", "total_sent", "sent");
      opens += pick(row, "unique_open_count", "open_count", "opened", "opens");
      clicks += pick(row, "click_count", "clicked", "clicks");
      replies += pick(row, "reply_count", "replied", "replies");
      bounces += pick(row, "bounce_count", "bounced", "bounces");
      positives += pick(row, "positive_reply_count", "interested_count", "positive_replies");
    } catch {
      /* skip a campaign that fails to load rather than failing the whole card */
    }
  }

  const rate = (part: number) => (sent ? Math.round((part / sent) * 1000) / 10 : 0);
  const metrics: Metric[] = [
    { key: "sent_total", label: "Emails sent (total)", value: Math.round(sent), unit: "count" },
    { key: "replies_total", label: "Replies (total)", value: Math.round(replies), unit: "count" },
    { key: "reply_rate", label: "Reply rate", value: rate(replies), unit: "percent" },
    ...(positives > 0 ? [{ key: "positive_total", label: "Positive replies (total)", value: Math.round(positives), unit: "count" as const }] : []),
    { key: "open_rate", label: "Open rate", value: rate(opens), unit: "percent" },
    { key: "bounce_rate", label: "Bounce rate", value: rate(bounces), unit: "percent", higherIsBetter: false },
    { key: "campaigns", label: "Campaigns counted", value: chosen.length, unit: "count" },
  ];

  return buildResult({
    id: "smartlead",
    name: "Cold Email (Smartlead)",
    category: "Outbound",
    status: "live",
    setupHint: "Smartlead API — lifetime totals summed across campaigns. (Per-day trends need the dated analytics endpoint.)",
    metrics,
  });
}

function mockResult(): ConnectorResult {
  const sent = makeDailySeries({ seed: "sl.sent", days: MOCK_DAYS, base: 320, noise: 0.3 });
  const opens = makeDailySeries({ seed: "sl.opens", days: MOCK_DAYS, base: 150, noise: 0.35 });
  const replies = makeDailySeries({ seed: "sl.replies", days: MOCK_DAYS, base: 14, noise: 0.6 });
  const positive = makeDailySeries({ seed: "sl.pos", days: MOCK_DAYS, base: 4, noise: 0.8 });
  const meetings = makeDailySeries({ seed: "sl.meet", days: MOCK_DAYS, base: 1.2, noise: 1.0 });
  const replyRate = makeSeries({ seed: "sl.rr", days: MOCK_DAYS, start: 4.2, dailyGrowth: 0, noise: 0.12, integer: false, floor: 0.5 });

  return buildResult({
    id: "smartlead",
    name: "Cold Email (Smartlead)",
    category: "Outbound",
    status: "mock",
    setupHint: "Smartlead API: set SMARTLEAD_API_KEY to go live.",
    metrics: [
      { key: "sent_7d", label: "Emails sent (7d)", value: sumLast(sent, 7), unit: "count", series: sent, deltaPct: windowDeltaPct(sent, 7) },
      { key: "replies_7d", label: "Replies (7d)", value: sumLast(replies, 7), unit: "count", series: replies, deltaPct: windowDeltaPct(replies, 7) },
      { key: "positive_7d", label: "Positive replies (7d)", value: sumLast(positive, 7), unit: "count", series: positive, deltaPct: windowDeltaPct(positive, 7) },
      { key: "meetings_7d", label: "Meetings booked (7d)", value: sumLast(meetings, 7), unit: "count", series: meetings },
      { key: "reply_rate", label: "Reply rate", value: lastValue(replyRate), unit: "percent", series: replyRate, deltaPct: deltaPct(replyRate, 14) },
      { key: "opens_7d", label: "Opens (7d)", value: sumLast(opens, 7), unit: "count", series: opens },
    ],
  });
}

export const smartleadConnector: Connector = {
  id: "smartlead",
  name: "Cold Email (Smartlead)",
  category: "Outbound",
  async fetch() {
    const apiKey = env("SMARTLEAD_API_KEY");
    if (!apiKey) return mockResult();
    try {
      return await fetchLive(apiKey);
    } catch (err) {
      return buildResult({
        id: "smartlead",
        name: "Cold Email (Smartlead)",
        category: "Outbound",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        setupHint: "SMARTLEAD_API_KEY is set but the request failed — check the key, plan access, or network.",
        metrics: [],
      });
    }
  },
};
