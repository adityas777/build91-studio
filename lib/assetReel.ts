/* ───────────────────────────────────────────────────────────────────────
   AssetReel data — the atlabs-inspired capability menu that sits right
   under the hero. Each card is a 4-second muted loop of the actual
   deliverable, not an icon. The cards ARE the message.

   Difference from PORTFOLIO_ITEMS (which drives BentoPortfolio):
     • BentoPortfolio = project-led gallery (9:16 tall cards, click-to-unmute)
     • AssetReel       = asset-led menu      (4:5 small cards, mute-locked, auto-scroll)

   Both can coexist because they answer different questions:
     • AssetReel:      "what types of assets do you make?"
     • BentoPortfolio: "show me work from real projects"

   ─── Asset swap when bespoke loops arrive ────────────────────────────
   Each card declares `mediaSrc` pointing at a local mp4. Until bespoke
   4-second loops exist, every card reuses /video/intro-reel-web.mp4.
   When ready:
     1. Drop the loop at /public/video/asset-reel/{slug}.mp4
        (4:5 portrait, ~720×900, H.264 CRF 24, max ~500KB).
     2. Drop the poster at /public/images/asset-reel/{slug}.jpg
        (720×900 JPEG, ~100KB).
     3. Update the `mediaSrc` and `poster` paths below.
   No component-side changes needed.
   ─────────────────────────────────────────────────────────────────────── */

export type AssetReelCategory =
  | 'aerial-360'
  | '3d-walkthrough'
  | '3d-interior'
  | '3d-exterior'
  | 'cinematic-film'
  | 'plot-superimposition'
  | 'vertical-reel'
  | 'microsite-loop';

export type AssetReelItem = {
  id: string;
  /** Top-left category chip — what kind of asset this is. */
  category: string;
  /** Bottom caption — project this came from. */
  project: string;
  /** Top-right aspect chip — production spec. */
  aspect: '9:16' | '4:5' | '1:1' | '16:9';
  /** Footer chip — duration of the loop or finished asset. */
  duration: string;
  /** Footer chip — turnaround we're proud of for this asset type. */
  shipped: string;
  /** Card mood for the soft glow edge — keeps the row visually rhythmic. */
  tint: 'violet' | 'gold' | 'cool' | 'deep';
  /** Local MP4 path. Replace when bespoke loops are produced. */
  mediaSrc: string;
  /** Poster frame painted before video mounts + as a fallback. */
  poster: string;
};

// Placeholder paths — every card reuses these until the bespoke loops
// land. Search for PLACEHOLDER_VIDEO when replacing.
const PLACEHOLDER_VIDEO = '/video/intro-reel-web.mp4';

/** Seeded picsum portrait that stays stable across loads. */
/** Generates a themed visual placeholder poster as an inline SVG to eliminate picsum.photos redirects */
function getPlaceholderPoster(tint: 'violet' | 'gold' | 'cool' | 'deep', w = 720, h = 900) {
  const colors = {
    violet: { stop1: '#2e1065', stop2: '#0c0a0f' },
    gold: { stop1: '#422006', stop2: '#0c0a0f' },
    cool: { stop1: '#172554', stop2: '#0c0a0f' },
    deep: { stop1: '#0f172a', stop2: '#0c0a0f' },
  };
  const theme = colors[tint] || colors.violet;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="80%">
        <stop offset="0%" stop-color="${theme.stop1}" stop-opacity="0.8"/>
        <stop offset="70%" stop-color="${theme.stop2}"/>
        <stop offset="100%" stop-color="#05071a"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  const base64 = typeof btoa !== 'undefined'
    ? btoa(svg)
    : Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export const ASSET_REEL_ITEMS: AssetReelItem[] = [
  {
    id: 'aerial-360',
    category: 'Aerial 360°',
    project: 'Skyline Heights · Bengaluru',
    aspect: '4:5',
    duration: '0:04 loop',
    shipped: 'Shot in 1 day',
    tint: 'violet',
    mediaSrc: "/video/projects/Drone 360 with landmarks highlight01.mp4",
    poster: getPlaceholderPoster('violet'),
  },
  {
    id: '3d-walkthrough',
    category: '3D Walkthrough',
    project: 'Pavilion Towers · Hyderabad',
    aspect: '4:5',
    duration: '0:04 loop',
    shipped: 'Built in 6 days',
    tint: 'gold',
    mediaSrc: "/video/projects/3d-walkthrough.mp4",
    poster: getPlaceholderPoster('gold'),
  },
  {
    id: '3d-interior',
    category: '3D Interior Render',
    project: 'Aurora Residences · Mumbai',
    aspect: '4:5',
    duration: 'Still frame',
    shipped: 'Rendered in 3 days',
    tint: 'cool',
    mediaSrc: "/video/projects/3d-interior.mp4",
    poster: getPlaceholderPoster('cool'),
  },
  {
    id: '3d-exterior',
    category: '3D Exterior Render',
    project: 'The Crest · Pune',
    aspect: '4:5',
    duration: 'Still frame',
    shipped: 'Rendered in 4 days',
    tint: 'deep',
    mediaSrc: "/video/projects/3d-exterior.mp4",
    poster: getPlaceholderPoster('deep'),
  },
  {
    id: 'cinematic-film',
    category: 'Cinematic Project Film',
    project: 'Marina Bay · Mangaluru',
    aspect: '4:5',
    duration: '0:04 loop',
    shipped: 'Shipped in 14 days',
    tint: 'violet',
    mediaSrc: "/video/projects/cinematic-film.mp4",
    poster: getPlaceholderPoster('violet'),
  },
  {
    id: 'plot-superimposition',
    category: 'Plot Superimposition',
    project: 'Greenway Estates · Raipur',
    aspect: '4:5',
    duration: '0:04 loop',
    shipped: 'Built in 5 days',
    tint: 'gold',
    mediaSrc: "/video/projects/plot-superimposition.mp4",
    poster: getPlaceholderPoster('gold'),
  },
  {
    id: 'vertical-reel',
    category: 'Vertical Reel',
    project: 'Solstice Living · Bengaluru',
    aspect: '9:16',
    duration: '0:15 cut',
    shipped: 'Edited in 2 days',
    tint: 'cool',
    mediaSrc: "/video/projects/vertical-reel.mp4",
    poster: getPlaceholderPoster('cool'),
  }
];
