/**
 * Trackable call-to-action links.
 *
 * Give each offer a short memorable link and SAY THAT LINK ON THE SHOW
 * ("go to yoursite.com/go/call"). The /go/[slug] route counts the click,
 * then redirects to the destination with UTM parameters appended — so the
 * destination's own analytics (GA4, Fathom, your CRM) can attribute the
 * visit to the podcast without anyone having to remember UTM syntax.
 *
 * Add a row per offer. Slug = the bit after /go/.
 */
export interface TrackedLink {
  slug: string;
  label: string;
  destination: string;
  /** UTMs appended on redirect. Sensible podcast defaults if omitted. */
  utmSource?: string; // default "podcast"
  utmMedium?: string; // default "audio"
  utmCampaign?: string; // default = slug
}

export const TRACKED_LINKS: TrackedLink[] = [
  {
    slug: "call",
    label: "Book a discovery call",
    destination: "https://example.com/discovery-call",
  },
  {
    slug: "freebie",
    label: "Free podcast growth guide",
    destination: "https://example.com/growth-guide",
  },
  {
    slug: "course",
    label: "Course sales page",
    destination: "https://example.com/course",
    utmMedium: "audio-cta",
  },
];
