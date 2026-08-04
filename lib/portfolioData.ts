export type PortfolioCategory =
  | 'project-showcase'
  | '3d-visualization'
  | 'virtual-experiences'
  | 'marketing-stack'
  | 'digital-launchpad';

export type MediaType = 'image' | 'youtube' | 'vimeo' | 'video';

export type PortfolioItem = {
  id: string;
  title: string;
  category: PortfolioCategory;
  subcategory: string;
  mediaType: MediaType;
  /** Static cover-frame image. 900×1600 ideal (matches 9:16 card aspect). */
  thumbnail: string;
  /**
   * For `mediaType: 'video'` → local /public/video/work/{slug}.mp4 path.
   * For `mediaType: 'image'` → hi-res still URL.
   * For `mediaType: 'youtube' | 'vimeo'` → bare video ID.
   */
  mediaSrc: string;
  client?: string;
  description?: string;
  featured?: boolean;
};

export const CATEGORY_LABELS: Record<PortfolioCategory | 'all', string> = {
  all: 'All',
  'project-showcase': 'Project Showcase',
  '3d-visualization': '3D Visualization',
  'virtual-experiences': 'Virtual Experiences',
  'marketing-stack': 'Marketing Stack',
  'digital-launchpad': 'Digital Launchpad',
};

export const CATEGORY_ORDER: (PortfolioCategory | 'all')[] = [
  'all',
  'project-showcase',
  '3d-visualization',
  'virtual-experiences',
  'marketing-stack',
  'digital-launchpad',
];

/* ───────────────────────────────────────────────────────────────────────
   Media strategy — self-hosted MP4 reels
   ───────────────────────────────────────────────────────────────────────
   The Featured Reel strip on the homepage renders local MP4 files via
   SelfHostedReelCard. No Instagram embed, no Meta auth, no third-party
   scripts — total control over the player chrome.

   To populate:
     1. Drop the file at /public/video/work/{slug}.mp4 (9:16 vertical,
        ideally 720×1280 H.264 ~1-2 MB, see SelfHostedReelCard for an
        ffmpeg recipe).
     2. Drop a cover image at /public/images/work/{slug}.jpg (900×1600).
        Or skip and the picsum placeholder stays until you do.

   Until you populate, every item points at the existing intro reel and
   the picsum placeholder so the page renders today.
   ─────────────────────────────────────────────────────────────────────── */

/** Picsum portrait thumbnail with a stable seed (same seed → same image). */
function pic(seed: string, w = 900, h = 1600) {
  return `https://picsum.photos/seed/${encodeURIComponent(`b91-${seed}`)}/${w}/${h}`;
}

// REPLACE: drop bespoke 9:16 mp4s in /public/video/work/ and update the
// mediaSrc per item. Until then, every item plays the studio intro reel.
const PLACEHOLDER_VIDEO = '/video/intro-reel-web.mp4';

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  // ─── Project Showcase (4) ───────────────────────────────────────────────
  {
    id: 'ps-001',
    title: 'Skyline Heights — Aerial 360',
    category: 'project-showcase',
    subcategory: 'Aerial 360',
    mediaType: 'video',
    thumbnail: pic('skyline-aerial'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/skyline-aerial.mp4
    client: 'Vertex Realty',
    description:
      'Interactive aerial 360° showcasing connectivity, landmarks and the surrounding skyline of a 24-acre integrated township.',
    featured: true,
  },
  {
    id: 'ps-002',
    title: 'Greenway Estates — Plot Map',
    category: 'project-showcase',
    subcategory: 'Plotted Development',
    mediaType: 'video',
    thumbnail: pic('greenway-plot'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/greenway-plot.mp4
    client: 'Greenway Developers',
    description:
      'Live plot availability layer over a high-resolution aerial — buyers tap and explore every parcel.',
    featured: true,
  },
  {
    id: 'ps-003',
    title: 'Marina Bay — Signature Film',
    category: 'project-showcase',
    subcategory: 'Signature Film',
    mediaType: 'video',
    thumbnail: pic('marina-film'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/marina-film.mp4
    client: 'Coastline Group',
    description:
      'A cinematic project film blending aerial cinematography, drone, 3D and brand storytelling.',
    featured: true,
  },
  {
    id: 'ps-004',
    title: 'Riverstone — Location Intelligence',
    category: 'project-showcase',
    subcategory: 'Location Intelligence',
    mediaType: 'video',
    thumbnail: pic('riverstone-loc'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/riverstone-loc.mp4
    client: 'Riverstone Realty',
    featured: true,
  },

  // ─── 3D Visualization (5) ───────────────────────────────────────────────
  {
    id: 'v3d-001',
    title: 'Aurora Residences — Living Room',
    category: '3d-visualization',
    subcategory: '3D Interior',
    mediaType: 'video',
    thumbnail: pic('aurora-living'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/aurora-living.mp4
    client: 'Aurora Builders',
    featured: true,
  },
  {
    id: 'v3d-002',
    title: 'The Crest — Facade Render',
    category: '3d-visualization',
    subcategory: '3D Exterior',
    mediaType: 'video',
    thumbnail: pic('crest-facade'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/crest-facade.mp4
    client: 'Crestline Estates',
    featured: true,
  },
  {
    id: 'v3d-003',
    title: 'Oasis Club — Pool Deck',
    category: '3d-visualization',
    subcategory: '3D Amenity',
    mediaType: 'video',
    thumbnail: pic('oasis-pool'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/oasis-pool.mp4
    client: 'Oasis Living',
    featured: true,
  },
  {
    id: 'v3d-004',
    title: 'Habitat 21 — Master Bedroom',
    category: '3d-visualization',
    subcategory: '3D Interior',
    mediaType: 'video',
    thumbnail: pic('habitat-bedroom'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/habitat-bedroom.mp4
    client: 'Habitat Spaces',
  },
  {
    id: 'v3d-005',
    title: 'Atrium Plaza — Lobby Render',
    category: '3d-visualization',
    subcategory: '3D Interior',
    mediaType: 'video',
    thumbnail: pic('atrium-lobby'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/atrium-lobby.mp4
  },

  // ─── Virtual Experiences (3) ────────────────────────────────────────────
  {
    id: 've-001',
    title: 'Pavilion Towers — Walkthrough',
    category: 'virtual-experiences',
    subcategory: '3D Walkthrough',
    mediaType: 'video',
    thumbnail: pic('pavilion-walkthrough'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/pavilion-walkthrough.mp4
    client: 'Pavilion Group',
    featured: true,
  },
  {
    id: 've-002',
    title: 'Lakeside Villas — Virtual Tour',
    category: 'virtual-experiences',
    subcategory: 'Virtual Tour',
    mediaType: 'video',
    thumbnail: pic('lakeside-tour'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/lakeside-tour.mp4
    client: 'Lakeside Developers',
  },
  {
    id: 've-003',
    title: 'Crystal Heights — Aerial Tour Frame',
    category: 'virtual-experiences',
    subcategory: 'Interactive Aerial',
    mediaType: 'video',
    thumbnail: pic('crystal-aerial'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/crystal-aerial.mp4
  },

  // ─── Marketing Stack (3) ────────────────────────────────────────────────
  {
    id: 'ms-001',
    title: 'Solstice Living — Vertical Reel',
    category: 'marketing-stack',
    subcategory: 'Reel / Shorts',
    mediaType: 'video',
    thumbnail: pic('solstice-reel'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/solstice-reel.mp4
    client: 'Solstice Developers',
  },
  {
    id: 'ms-002',
    title: 'Meridian One — Project Website',
    category: 'marketing-stack',
    subcategory: 'Website',
    mediaType: 'video',
    thumbnail: pic('meridian-web'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/meridian-web.mp4
    client: 'Meridian Realty',
    featured: true,
  },
  {
    id: 'ms-003',
    title: 'Vantage Living — Digital Brochure',
    category: 'marketing-stack',
    subcategory: 'Digital Brochure',
    mediaType: 'video',
    thumbnail: pic('vantage-brochure'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/vantage-brochure.mp4
  },

  // ─── Digital Launchpad (2) ──────────────────────────────────────────────
  {
    id: 'dl-001',
    title: 'Ascend Towers — Microsite',
    category: 'digital-launchpad',
    subcategory: 'Project Microsite',
    mediaType: 'video',
    thumbnail: pic('ascend-microsite'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/ascend-microsite.mp4
    client: 'Ascend Group',
    description:
      'All-in-one launchpad — 3D tours, films, brochures and contact forms unified in one shareable URL.',
    featured: true,
  },
  {
    id: 'dl-002',
    title: 'Horizon Estates — Microsite Reveal',
    category: 'digital-launchpad',
    subcategory: 'Microsite Film',
    mediaType: 'video',
    thumbnail: pic('horizon-reveal'),
    mediaSrc: PLACEHOLDER_VIDEO, // REPLACE: /video/work/horizon-reveal.mp4
    client: 'Horizon Group',
  },
];

export const FEATURED_ITEMS = PORTFOLIO_ITEMS.filter((i) => i.featured);
