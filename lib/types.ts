export type MetricUnit = "count" | "currency" | "percent" | "duration";

export interface MetricPoint {
  date: string; // ISO yyyy-mm-dd
  value: number;
}

export interface Metric {
  key: string;
  label: string;
  value: number;
  unit?: MetricUnit;
  /** percentage change vs the previous comparable period */
  deltaPct?: number;
  /** higher value is good (true) or bad (false). default true */
  higherIsBetter?: boolean;
  /** historical series, oldest -> newest */
  series?: MetricPoint[];
  note?: string;
}

export type ConnectorStatus = "live" | "mock" | "manual" | "error";

export interface ConnectorResult {
  id: string;
  name: string;
  category: string;
  status: ConnectorStatus;
  /** ISO timestamp of when the data was last refreshed */
  lastSync: string;
  metrics: Metric[];
  /** populated when status === "error" */
  error?: string;
  /** short human note about how this source is wired */
  setupHint?: string;
}

export interface Connector {
  id: string;
  name: string;
  category: string;
  /** Pull the latest data. Implementations should never throw — return an
   *  error ConnectorResult instead so one bad source can't break the board. */
  fetch(): Promise<ConnectorResult>;
}

/**
 * One row of the per-episode performance table. Merges what each platform
 * knows about the same episode (RSS downloads, YouTube views, consumption).
 */
export interface EpisodeStats {
  id: string;
  title: string;
  publishedAt: string; // ISO yyyy-mm-dd
  /** downloads in the first 7 days after publish — the industry benchmark number */
  downloads7d: number;
  downloadsAllTime: number;
  youtubeViews: number;
  /** avg % of the episode actually listened to (Apple/Spotify), when known */
  avgConsumptionPct?: number;
}

export interface DashboardSnapshot {
  generatedAt: string;
  connectors: ConnectorResult[];
  episodes: EpisodeStats[];
}
