import type { DashboardSnapshot } from "./types";

export interface ReachSlice {
  key: string;
  label: string;
  value: number;
  /** tailwind bg class for the stacked bar */
  cls: string;
  note: string;
}

function metric(snap: DashboardSnapshot, connectorId: string, key: string): number {
  const c = snap.connectors.find((c) => c.id === connectorId);
  return c?.metrics.find((m) => m.key === key)?.value ?? 0;
}

/** Where the last 30 days of reach came from (the stacked bar). */
export function reachMix(snap: DashboardSnapshot): ReachSlice[] {
  return [
    {
      key: "audio",
      label: "Audio downloads",
      value: metric(snap, "host", "downloads_30d"),
      cls: "bg-accent",
      note: "RSS feed via the host — Apple, Spotify, Overcast, every app",
    },
    {
      key: "video",
      label: "YouTube views",
      value: metric(snap, "youtube", "views_30d"),
      cls: "bg-good",
      note: "Full episodes + Shorts on the channel",
    },
    {
      key: "clips",
      label: "Social clip views",
      value: metric(snap, "social-clips", "clip_views_30d"),
      cls: "bg-warn",
      note: "Reels / TikTok / LinkedIn — shallow but wide",
    },
  ];
}

export interface AppShare {
  label: string;
  pct: number;
}

/** Listening-app split of the audio downloads (from the host's apps report). */
export function listeningApps(snap: DashboardSnapshot): AppShare[] {
  const host = snap.connectors.find((c) => c.id === "host");
  if (!host) return [];
  const pairs: [string, string][] = [
    ["share_apple", "Apple Podcasts"],
    ["share_spotify", "Spotify"],
    ["share_overcast", "Overcast"],
    ["share_browser", "Web / embed"],
    ["share_other", "Other apps"],
  ];
  return pairs
    .map(([key, label]) => ({ label, pct: host.metrics.find((m) => m.key === key)?.value ?? 0 }))
    .filter((s) => s.pct > 0);
}
