import type { MetricUnit } from "./types";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + "M";
  if (abs >= 10_000) return Math.round(n / 1000) + "k";
  if (abs >= 1000) return (n / 1000).toFixed(1) + "k";
  return Math.round(n).toLocaleString();
}

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sym = currencySymbol(CURRENCY);
  if (abs >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sym}${Math.round(n / 1000)}k`;
  if (abs >= 1000) return `${sym}${(n / 1000).toFixed(1)}k`;
  return `${sym}${Math.round(n).toLocaleString()}`;
}

export function formatExactCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0);
}

function currencySymbol(code: string): string {
  switch (code) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return code + " ";
  }
}

export function formatMetricValue(value: number, unit?: MetricUnit): string {
  switch (unit) {
    case "currency": return formatCurrency(value);
    case "percent": return `${(Math.round(value * 10) / 10).toLocaleString()}%`;
    case "duration": return value === 0 ? "today" : value === 1 ? "1 day" : `${Math.round(value)} days`;
    default: return formatNumber(value);
  }
}

export function formatDelta(deltaPct?: number): string | null {
  if (deltaPct === undefined || deltaPct === null || !isFinite(deltaPct)) return null;
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${deltaPct.toFixed(1)}%`;
}

/** "is this delta good?" considering whether higher is better for the metric. */
export function deltaTone(deltaPct: number | undefined, higherIsBetter = true): "good" | "bad" | "flat" {
  if (deltaPct === undefined || Math.abs(deltaPct) < 0.05) return "flat";
  const positive = deltaPct > 0;
  return positive === higherIsBetter ? "good" : "bad";
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!isFinite(ms)) return "";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
