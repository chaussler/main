import type { Connector, ConnectorResult, DashboardSnapshot } from "../types";
import { getEpisodes } from "../podcast/episodes";
import { hostConnector } from "./host";
import { op3Connector } from "./op3";
import { appleConnector } from "./apple";
import { spotifyConnector } from "./spotify";
import { youtubeConnector } from "./youtube";
import { socialClipsConnector } from "./socialClips";
import { attributionConnector } from "./attribution";
import { emailListConnector } from "./emailList";

/**
 * The registry. To add a new source: build a `Connector` in this folder and
 * add it here. Order follows the funnel — audio reach, video reach, social
 * reach, then what that reach does for the business.
 */
export const CONNECTORS: Connector[] = [
  hostConnector,
  op3Connector,
  appleConnector,
  spotifyConnector,
  youtubeConnector,
  socialClipsConnector,
  attributionConnector,
  emailListConnector,
];

/** Category display order on the dashboard. */
export const CATEGORY_ORDER = [
  "Audio",
  "Video",
  "Social",
  "Attribution",
  "Email",
];

/** Fixed card order inside a category (funnel order beats alphabetical). */
const ID_ORDER = CONNECTORS.map((c) => c.id);

/** Run every connector; never throws — a failing connector becomes an error card. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [results, episodes] = await Promise.all([
    Promise.all(
      CONNECTORS.map(async (c): Promise<ConnectorResult> => {
        try {
          return await c.fetch();
        } catch (err) {
          return {
            id: c.id,
            name: c.name,
            category: c.category,
            status: "error",
            lastSync: new Date().toISOString(),
            metrics: [],
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    ),
    getEpisodes(),
  ]);

  results.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
    return ID_ORDER.indexOf(a.id) - ID_ORDER.indexOf(b.id);
  });

  return { generatedAt: new Date().toISOString(), connectors: results, episodes };
}
