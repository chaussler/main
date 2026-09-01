# Podcast Reach Dashboard

Podcasters can't see their real reach. Downloads aren't listens, YouTube has
great analytics but is usually the smallest slice, Apple and Spotify each only
see their own listeners, clips scatter stats across four social platforms, and
almost nobody tags their call-to-action links — so nobody can say whether the
show actually moves the business.

This dashboard pulls every slice into one screen and keeps the numbers honest:

| Source | What it contributes | How it connects |
|---|---|---|
| Podcast host (RSS) | Downloads across **every** app — the upper bound of audio reach | Host API (Buzzsprout, Transistor, Captivate, Podbean, Libsyn, RSS.com…) |
| **OP3 prefix** | Host-independent, IAB-filtered downloads + est. unique audience | Free open-source prepend (`op3.dev/e/…`) — the modern successor to the Podtrac prefix |
| Apple Podcasts | True **behavior**: plays, engaged listeners, followers, avg consumption (usually 40-60% of listening) | No public API — weekly CSV from Podcasts Connect, or your host's Apple integration |
| Spotify | Streams, listen-through, followers, demographics (usually 4-20%) | No public API — weekly numbers from Spotify for Creators, or host integration |
| YouTube | Views, watch time, retention, subs — the most robust analytics anywhere | YouTube Analytics API v2 (OAuth) |
| Social clips | Shallow-but-wide clip views (Reels / TikTok / LinkedIn) | Meta Graph API, TikTok Display API, LinkedIn Marketing API |
| **CTA links** | Clicks from show → offers, with UTMs appended automatically | Built in — works today, no service needed |
| Email list | The audience you own | Mailchimp / ConvertKit / Beehiiv API |

Plus two things no single platform gives you:

- **Industry benchmark** — your typical episode's first-7-day downloads ranked
  against all podcasts (Top 1/5/10/25/50% tiers from Buzzsprout's published
  global stats; editable in `lib/podcast/benchmarks.ts`). Most podcasters
  don't know that ~30 first-week downloads already beats half of all shows.
- **Episode table** — per-episode first-week downloads, all-time, YouTube
  views, and consumption, each with its benchmark badge.

## The philosophy: keep "reach" honest

The board never pretends the slices are the same thing. It shows three ladders:

1. **Total reach (30d)** — downloads + YouTube views + clip views. The honest
   upper bound of eyes & ears.
2. **Confirmed plays (30d)** — Apple plays + Spotify streams + YouTube views.
   Someone pressed play.
3. **Engagement** — consumption %, listen-through, avg % viewed. They stayed.

And then the one that pays the bills: **CTA clicks** — proof the show sends
people to your offers.

## The attribution links (works out of the box)

Most podcasters never build UTM links, so define each offer once in
`lib/links/config.ts` and say the short link on air:

```
yoursite.com/go/freebie
```

`/go/freebie` counts the click, then 302-redirects to the destination with
`utm_source=podcast&utm_medium=audio&utm_campaign=freebie` appended — GA4 /
Fathom / your CRM attribute the visit with zero marketing skills required.
Clicks show up on the "CTA Links" card. (Demo build holds clicks in memory;
persist them to SQLite/Postgres/Vercel KV in `lib/links/store.ts` for
production.)

## Running it

```bash
npm install
cp .env.example .env      # fill in whatever credentials you have (optional)
npm run dev               # http://localhost:3000
```

With no `.env`, every source shows realistic **demo data** so you see the full
layout immediately — badges mark each card `live`, `demo data`, or `manual`
(Apple and Spotify have no public analytics APIs; those are weekly exports or
your host's platform integrations).

## How it's wired

```
app/
  page.tsx               server-renders the first snapshot
  api/metrics/route.ts   GET -> { generatedAt, connectors[], episodes[] }
  go/[slug]/route.ts     the attribution redirect (counts click, appends UTMs)
components/              Dashboard, ReachMix, BenchmarkPanel, EpisodeTable,
                         ConnectorCard, MetricTile, Sparkline, StatusBadge
lib/
  types.ts               Connector / Metric / EpisodeStats shapes
  connectors/            one file per source (host, op3, apple, spotify,
                         youtube, socialClips, attribution, emailList)
  podcast/benchmarks.ts  industry percentile tiers + helpers
  podcast/episodes.ts    per-episode merge (host downloads + YouTube views)
  links/                 tracked-link config + click store
  headline.ts            the big top-of-page tiles
  reach.ts               reach mix + listening-app split
```

Each connector returns demo data until its credentials exist in `.env`, and
carries a `// LIVE WIRING` comment with the exact endpoints to call. Replace
the mock block, map into the same `Metric[]` shape, done — cards, sparklines,
headline tiles and the reach mix all update automatically.

### Suggested rollout order

1. **Podcast host API** — downloads + listening-app split. One key, biggest slice.
2. **OP3 prefix** — free, one settings field at the host, and you get
   host-independent verification + unique-audience estimates forever after.
3. **CTA links** — define real offers in `lib/links/config.ts`, start saying
   `/go/...` on air, persist clicks to a small DB.
4. **YouTube** — OAuth once, best API of the bunch.
5. **Apple / Spotify** — weekly 5-minute export ritual (or host integration);
   this is where consumption/behavior data lives.
6. **Clips** — Meta first (biggest clip slice for most), TikTok/LinkedIn after.

## Notes / limitations

- Sparkline history needs stored snapshots for live data — persist a daily
  snapshot to SQLite/Postgres so trends survive restarts (`Metric.series` is
  already shaped for it). Demo mode generates 90 days of history.
- Downloads will always exceed "confirmed plays" — that's expected (auto-
  downloads, prefetch). A big host-vs-OP3 gap is the number to watch.
- Benchmark tiers are global, all-genres numbers; niche B2B shows convert
  far better per listener than the tiers suggest. Progress vs. yourself
  (the delta chips) matters more than the ladder.
