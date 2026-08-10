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

export const PORTFOLIO_ITEMS: PortfolioItem[] = [];

export const FEATURED_ITEMS = PORTFOLIO_ITEMS.filter((i) => i.featured);
