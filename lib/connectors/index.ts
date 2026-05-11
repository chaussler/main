import type { Connector, ConnectorResult, DashboardSnapshot } from "../types";
import { instagramConnector } from "./instagram";
import { facebookConnector } from "./facebook";
import { linkedinConnector } from "./linkedin";
import { linkedinNewsletterConnector } from "./linkedinNewsletter";
import { emailListConnector } from "./emailList";
import { smartleadConnector } from "./smartlead";
import { courseSalesConnector } from "./courseSales";
import { amazonBooksConnector } from "./amazonBooks";
import { speakingConnector } from "./speaking";
import { stripeConnector } from "./stripe";

/**
 * The registry. To add a new touch point: build a `Connector` in this folder
 * and add it here. Order roughly matches the weekly review flow.
 */
export const CONNECTORS: Connector[] = [
  instagramConnector,
  facebookConnector,
  linkedinConnector,
  linkedinNewsletterConnector,
  emailListConnector,
  smartleadConnector,
  courseSalesConnector,
  amazonBooksConnector,
  speakingConnector,
  stripeConnector,
];

/** Category display order on the dashboard. */
export const CATEGORY_ORDER = [
  "Payments",
  "Sales",
  "Email",
  "Newsletter",
  "Social",
  "Outbound",
  "Books",
  "Speaking",
];

/** Run every connector; never throws — a failing connector becomes an error card. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const results = await Promise.all(
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
  );

  results.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
    return a.name.localeCompare(b.name);
  });

  return { generatedAt: new Date().toISOString(), connectors: results };
}
