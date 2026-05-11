# Business Dashboard

A single-screen, auto-refreshing dashboard that pulls together every weekly
touch point for the business:

| # | Touch point | Source | How it connects |
|---|-------------|--------|-----------------|
| 1 | Instagram | Meta Graph API | Business account + Page token + `instagram_manage_insights` |
| 1 | Facebook | Meta Graph API | Page token + `read_insights` (same app as Instagram) |
| 1 | LinkedIn (Page) | LinkedIn Marketing API | Approved app + Company-Page admin. *Personal profiles have no API.* |
| 2 | Email list | Mailchimp / ConvertKit / Beehiiv API | Provider API key |
| 3 | LinkedIn Newsletter | — *(no API)* | Manual weekly entry or pull from a sheet |
| 4 | Cold email | **Smartlead API** | `SMARTLEAD_API_KEY`, aggregate campaign analytics |
| 5 | Course sales (website) | Stripe (or Teachable/Thinkific/Gumroad/…) | Filter Stripe by product, or platform API |
| 6 | Book sales (Amazon) | — *(no author sales API)* | Weekly KDP royalty-report upload, or a tool like Bookreport |
| 7 | Speaking / lectures | — *(no platform)* | Small in-app form / Airtable / Notion / Sheet |
| — | Payments | **Stripe API** | `STRIPE_SECRET_KEY` (+ webhook for real-time) |

## Is this doable? Short version

**Yes** — with two honest caveats:

1. **Not everything has an API.** Stripe, Meta (IG/FB), Smartlead and most email
   tools are great. LinkedIn is restrictive (Company Pages only, app review
   required) and **LinkedIn newsletters, Amazon KDP author sales, and speaking
   engagements have no usable API** — those are manual entry (a form or a
   spreadsheet the dashboard reads). The dashboard marks each source `live`,
   `demo data`, or `manual` so it's always clear what you're looking at.
2. **"Real-time" means different things per source.** Stripe can be truly
   real-time via webhooks. Social/email APIs are rate-limited, so those refresh
   on a schedule (the UI re-polls every 60s; connectors can cache server-side).

Everything is built around a **pluggable connector** model, so you can ship
Stripe live today and wire the rest in as you get API access — nothing else has
to change.

## Running it

```bash
npm install
cp .env.example .env      # fill in whatever credentials you have (optional)
npm run dev               # http://localhost:3000
```

With no `.env`, every source shows realistic **demo data** so you can see the
whole layout immediately. Add a key and that source flips to **live** on the
next refresh.

```bash
npm run build && npm start   # production build
```

## How it's wired

```
app/
  page.tsx              server-renders the first snapshot
  api/metrics/route.ts  GET -> { generatedAt, connectors[] }  (the dashboard polls this)
components/             Dashboard, ConnectorCard, MetricTile, Sparkline, StatusBadge
lib/
  types.ts              Connector / Metric / ConnectorResult shapes
  connectors/           one file per source (instagram, facebook, linkedin,
                        linkedinNewsletter, emailList, smartlead, courseSales,
                        amazonBooks, speaking, stripe) + index.ts (registry)
  headline.ts           the big top-of-page KPI tiles
  mock.ts               deterministic demo-data generators
  format.ts             number / currency / delta / "time ago" formatting
```

### Adding or going live on a connector

Each connector currently builds demo data and returns
`status: "mock"` (or `"manual"` where no API exists). To make one live:

1. Add the credentials to `.env` (see `.env.example`).
2. Open the connector file (e.g. `lib/connectors/stripe.ts`) — each has a
   `// LIVE WIRING` comment block with the exact endpoints to call.
3. Replace the mock block with the real API calls, map the response into the
   same `Metric[]` shape, and set `status` to `"live"`.
4. The card, sparklines, headline tiles and trends all update automatically.

> Tip: do **Stripe first**. It's the easiest integration and covers course
> sales, MRR, refunds and most revenue in one shot. Use a webhook
> (`charge.succeeded`, `invoice.paid`, `customer.subscription.*`) for genuine
> real-time updates rather than polling.

### Suggested rollout order

1. **Stripe** (live, webhook) — revenue, MRR, course sales, refunds.
2. **Email list** (Mailchimp/ConvertKit/Beehiiv) — subscribers, open/click.
3. **Smartlead** — cold-email sent/replies/positive/meetings.
4. **Meta** (Instagram + Facebook) — once the app passes review.
5. **LinkedIn Page** — once the Marketing API app is approved.
6. **Manual sources** — add a small form (or wire a Google Sheet/Airtable) for
   the LinkedIn newsletter numbers, Amazon KDP royalties, and speaking gigs.

## Notes / limitations

- Historical trends (the sparklines) need stored snapshots. The demo generates
  90 days of fake history; for live data you'll want to persist a daily snapshot
  to a small database (SQLite/Postgres) so trends survive restarts. That's a
  natural next step and the `Metric.series` field is already there for it.
- LinkedIn / Meta app review can take several days — start those early.
- Keep secrets in `.env` (git-ignored). For deployment (e.g. Vercel) set them
  as environment variables in the host.
