import type { EpisodeStats } from "../types";
import { mulberry32, hashString } from "../mock";

// LIVE WIRING:
//   The episode table merges per-episode numbers from two sources:
//     1. The podcast host's per-episode download stats
//        - Buzzsprout: GET /api/{podcast_id}/episodes.json  -> total_plays per episode
//        - Transistor: GET /v1/analytics/episodes/{id}
//        - Podbean:    GET /v1/podcastStats/stats
//        - Captivate:  GET /episodes/{id}/analytics
//     2. YouTube Analytics API v2 (per-video views, matched by title/date)
//   Replace `mockEpisodes()` with a fetch that maps those responses into
//   `EpisodeStats[]`. The benchmark badges and the table need nothing else.

const TITLES = [
  "The pricing conversation nobody wants to have",
  "Listener Q&A: growing past a plateau",
  "From burnout to a repeatable content system",
  "What your download numbers actually mean",
  "Guest: turning listeners into clients",
  "The launch that almost didn't happen",
  "Behind the scenes of our best quarter",
  "Stop chasing virality — do this instead",
  "Guest: the psychology of loyal audiences",
  "Our exact publishing workflow, step by step",
  "When to quit a show (and when to double down)",
  "The offer your audience is waiting for",
];

/**
 * 12 recent weekly episodes with plausible, deterministic numbers.
 * Newest first. The show trends slowly upward, with occasional spikes
 * (a guest with an audience, a clip that traveled).
 */
export function mockEpisodes(): EpisodeStats[] {
  const rand = mulberry32(hashString("episodes.v1"));
  const episodes: EpisodeStats[] = [];
  const latestNumber = 62;

  for (let i = 0; i < TITLES.length; i++) {
    const weeksAgo = i; // one episode per week
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (weeksAgo * 7 + 3));

    // Older episodes had a slightly smaller launch audience; occasional spike.
    const base = 380 * Math.pow(0.985, weeksAgo);
    const spike = rand() < 0.18 ? 1.7 + rand() : 1;
    const noise = 0.85 + rand() * 0.3;
    const downloads7d = Math.round(base * spike * noise);

    // Long tail: episodes keep collecting downloads after week one.
    const ageWeeks = weeksAgo + 1;
    const tailFactor = 1 + Math.min(1.6, 0.22 * Math.log1p(ageWeeks * 2));
    const downloadsAllTime = Math.round(downloads7d * tailFactor);

    const youtubeViews = Math.round(downloads7d * (0.18 + rand() * 0.2) * tailFactor);
    const avgConsumptionPct = Math.round(58 + rand() * 24);

    episodes.push({
      id: `ep-${latestNumber - i}`,
      title: `${latestNumber - i}. ${TITLES[i]}`,
      publishedAt: d.toISOString().slice(0, 10),
      downloads7d,
      downloadsAllTime,
      youtubeViews,
      avgConsumptionPct,
    });
  }
  return episodes;
}

export async function getEpisodes(): Promise<EpisodeStats[]> {
  // Swap for live host + YouTube data (see LIVE WIRING above).
  return mockEpisodes();
}
