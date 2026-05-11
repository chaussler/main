import type { ConnectorResult, ConnectorStatus, Metric } from "../types";

/** How many days of history the mock generators produce. */
export const MOCK_DAYS = 90;

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Read an env var; returns undefined if missing/empty. Used by connectors to
 * decide whether they can run "live" or should fall back to mock data.
 */
export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export function buildResult(args: {
  id: string;
  name: string;
  category: string;
  status?: ConnectorStatus;
  metrics: Metric[];
  setupHint?: string;
  error?: string;
}): ConnectorResult {
  return {
    id: args.id,
    name: args.name,
    category: args.category,
    status: args.status ?? "mock",
    lastSync: nowIso(),
    metrics: args.metrics,
    setupHint: args.setupHint,
    error: args.error,
  };
}
