import { NextResponse } from "next/server";
import { getLink, recordClick } from "@/lib/links/store";

export const dynamic = "force-dynamic";

/**
 * The attribution redirect: /go/freebie -> counts the click, then 302s to the
 * destination with UTM parameters appended. Podcasters say the short link on
 * air; the UTMs are added automatically so downstream analytics (GA4 etc.)
 * see utm_source=podcast without anyone building tagged URLs by hand.
 */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const link = getLink(params.slug);
  if (!link) {
    return new NextResponse("Unknown link. Add it to lib/links/config.ts.", { status: 404 });
  }

  recordClick(link.slug);

  const url = new URL(link.destination);
  const utm: Record<string, string> = {
    utm_source: link.utmSource ?? "podcast",
    utm_medium: link.utmMedium ?? "audio",
    utm_campaign: link.utmCampaign ?? link.slug,
  };
  for (const [k, v] of Object.entries(utm)) {
    if (!url.searchParams.has(k)) url.searchParams.set(k, v);
  }

  return NextResponse.redirect(url.toString(), 302);
}
