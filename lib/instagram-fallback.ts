/* ───────────────────────────────────────────────────────────────────────
   Instagram — hardcoded fallback reels (offline / API failure mode)
   ───────────────────────────────────────────────────────────────────────
   These render when the live Instagram Graph API call fails for any
   reason — bad token, rate-limited, network down, IG outage, expired
   media URL, missing env vars. The home page never shows an empty
   "Selected Work" grid.

   Designed to look indistinguishable from the live reels:
     • Same `Reel` shape as `lib/instagram.ts` returns
     • `thumbnailUrl` should point at a static poster image in
       /public/reels-fallback/ (drop 6 JPGs in there)
     • `mediaUrl` should be a self-hosted MP4 in /public/video/reels-fallback/
       (drop 6 reel-format clips in there — 9:16, ~10-20MB each)
     • `permalink` is the real IG post URL — click-through still works

   ── CONFIRM: fill these 6 entries with real assets ───────────────────
   Steps:
     1. Pick the 6 hero reels off Instagram (best-performing or most
        recent "wow" clips — anything that represents the studio at
        its strongest)
     2. For each:
        a. Right-click the reel cover on instagram.com → "Save image as"
           → save into /public/reels-fallback/{slug}.jpg
        b. Download the reel mp4 (any tool — e.g. paste the permalink
           into snapsave.app / instaloader) → re-encode to web format:
             ffmpeg -i src.mp4 -vf "scale=720:-2,fps=30" \
               -c:v libx264 -crf 24 -preset slow -movflags +faststart \
               -c:a aac -b:a 96k out.mp4
           → save into /public/video/reels-fallback/{slug}.mp4
        c. Grab the permalink (https://www.instagram.com/reel/...) and
           paste it as `permalink`
        d. Caption: copy the first sentence of the IG caption, ≤80 chars

   The `id` field below uses a `fallback-N` namespace so we can tell
   live vs fallback reels apart in dev tools.
   ─────────────────────────────────────────────────────────────────────── */

import type { Reel } from './instagram';

function getPlaceholderPoster(seed: string, w = 720, h = 1280) {
  const themes: Record<string, { stop1: string; stop2: string }> = {
    'drone-360': { stop1: '#1e1b4b', stop2: '#090514' },
    'exterior': { stop1: '#422006', stop2: '#090514' },
    'interior': { stop1: '#172554', stop2: '#090514' },
    'walkthrough': { stop1: '#311042', stop2: '#090514' },
    'superimposition': { stop1: '#064e3b', stop2: '#090514' },
    'balcony-view': { stop1: '#0f172a', stop2: '#090514' },
  };
  const theme = themes[seed] || themes['drone-360'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="g" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stop-color="${theme.stop1}" stop-opacity="0.75"/>
        <stop offset="65%" stop-color="${theme.stop2}"/>
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

export const FALLBACK_REELS: Reel[] = [
  {
    id: 'fallback-1',
    mediaUrl: '/video/projects/Drone 360 with landmarks highlight01.mp4',
    thumbnailUrl: getPlaceholderPoster('drone-360'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Aerial 360° drone view showcasing landmarks and project surroundings.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
  {
    id: 'fallback-2',
    mediaUrl: '/video/projects/exterior renders.mp4',
    thumbnailUrl: getPlaceholderPoster('exterior'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Premium 3D exterior visualization and architectural rendering.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
  {
    id: 'fallback-3',
    mediaUrl: '/video/projects/interior renders.mp4',
    thumbnailUrl: getPlaceholderPoster('interior'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Immersive 3D interior design details and lighting visualization.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
  {
    id: 'fallback-4',
    mediaUrl: '/video/projects/3d walkthrough 02.mp4',
    thumbnailUrl: getPlaceholderPoster('walkthrough'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Cinematic 3D walkthrough showcasing the layout and scale.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
  {
    id: 'fallback-5',
    mediaUrl: '/video/projects/Superimposition01.mp4',
    thumbnailUrl: getPlaceholderPoster('superimposition'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Plot superimposition overlay mapping design plans to real-world drone footage.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
  {
    id: 'fallback-6',
    mediaUrl: '/video/projects/view from under construction balcony02.mp4',
    thumbnailUrl: getPlaceholderPoster('balcony-view'),
    permalink: 'https://www.instagram.com/build_91/',
    caption: 'Virtual balcony view showing direct site construction perspectives.',
    timestamp: '2025-01-01T00:00:00Z',
    isFallback: true,
  },
];

