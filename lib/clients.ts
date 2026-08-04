/* ───────────────────────────────────────────────────────────────────────
   Client / Partner logos used in the ClientLogoWall on home + about.
   ───────────────────────────────────────────────────────────────────────
   Files live in /public/images/clients/{slug}.png

   v1 ships with all logos in a single "Developers & Partners" segment.
   The `segment` field is already in the data model so we can re-shard
   into multiple rows (Grade-A Developers · Plotted/Township · Boutique ·
   Channel Partners) the moment we have a confirmed segmentation map.

   TODO (high-priority): replace the generic "Partner 01..09" names with
   the actual client/brand names. The alt text drives both accessibility
   and SEO. Rename `id`/`name` here — the file paths can stay.
   ─────────────────────────────────────────────────────────────────────── */

export type ClientSegment =
  | 'developers-partners' // catch-all v1 segment
  | 'grade-a'
  | 'plotted-township'
  | 'boutique'
  | 'channel-partners';

/** Geographic reach — surfaced as a small label below each logo so the
 *  wall doubles as a "we work across these markets" proof point. */
export type ClientCountry = 'India' | 'UAE' | 'Australia';

export type ClientLogo = {
  id: string;
  /** Brand name — used as alt text and visible label on hover/focus. */
  name: string;
  /** Path under /public, e.g. /images/clients/laxmi-developer.png */
  src: string;
  /** Native pixel dimensions are unknown; intrinsic ratio handled by CSS. */
  segment: ClientSegment;
  /** Where the client is based — drives the country pill under the card. */
  country: ClientCountry;
};

export const CLIENT_SEGMENT_LABELS: Record<ClientSegment, string> = {
  'developers-partners': 'Developers & Partners',
  'grade-a': 'Grade-A Developers',
  'plotted-township': 'Plotted & Township',
  boutique: 'Boutique Builders & Architects',
  'channel-partners': 'Channel Partners',
};

export const CLIENT_COUNTRY_LABELS: Record<ClientCountry, string> = {
  India: 'India',
  UAE: 'UAE',
  Australia: 'Australia',
};

/** Stable display order if/when we ever group the wall by country. */
export const CLIENT_COUNTRY_ORDER: ClientCountry[] = ['India', 'UAE', 'Australia'];

// ─── TODO: re-assign `country` per actual client geography. ─────────────
// Seeded as a reasonable mix (most India + a couple UAE/Australia) just
// so the country pill UI demonstrates the three markets. Override each
// row with the true country before going live.
export const CLIENT_LOGOS: ClientLogo[] = [
  {
    id: 'laxmi-developer',
    name: 'Laxmi Developer',
    src: '/images/clients/laxmi-developer.png',
    segment: 'developers-partners',
    country: 'India',
  },
  {
    id: 'western-arch',
    name: 'Western Arch',
    src: '/images/clients/western-arch.png',
    segment: 'developers-partners',
    country: 'India',
  },
  // ─── Rename these to real client names when confirmed ────────────────
  { id: 'partner-01', name: 'Partner 01', src: '/images/clients/partner-01.png', segment: 'developers-partners', country: 'Australia' },
  { id: 'partner-02', name: 'Partner 02', src: '/images/clients/partner-02.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-06', name: 'Partner 06', src: '/images/clients/partner-016.png', segment: 'developers-partners', country: 'UAE' },
  { id: 'partner-03', name: 'Partner 03', src: '/images/clients/partner-03.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-04', name: 'Partner 04', src: '/images/clients/partner-04.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-05', name: 'Partner 05', src: '/images/clients/partner-05.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-07', name: 'Partner 07', src: '/images/clients/partner-07.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-08', name: 'Partner 08', src: '/images/clients/partner-08.png', segment: 'developers-partners', country: 'India' },
  { id: 'partner-09', name: 'Partner 09', src: '/images/clients/partner-09.png', segment: 'developers-partners', country: 'India' },

];

/** Helper — segment-filtered list, preserves declared order. */
export function logosBySegment(segment: ClientSegment): ClientLogo[] {
  return CLIENT_LOGOS.filter((l) => l.segment === segment);
}

/** All known segments currently in use (drives the segment tab UI). */
export function activeSegments(): ClientSegment[] {
  const seen = new Set<ClientSegment>();
  for (const l of CLIENT_LOGOS) seen.add(l.segment);
  return Array.from(seen);
}
