'use client';

import { useIsDesktop } from '@/lib/useMediaQuery';

/* ───────────────────────────────────────────────────────────────────────
   AboutStudioVideo — the "Inside the Studio" team/office film on /about.
   ───────────────────────────────────────────────────────────────────────
   Two frame shapes (owner direction, 2026-06-10):
     • Mobile  (<768px): PORTRAIT 9:16 card, centered, max-w-[320px]
     • Desktop (≥768px): LANDSCAPE 16:9, full content width

   The frame shape is pure CSS (correct on first paint, no flash); only
   the video SOURCE swaps via useIsDesktop — same pattern as VideoHero,
   since browsers no longer honour <source media> inside <video>.

   ── ASSET SWAP ────────────────────────────────────────────────────────
   Desktop already plays the real film (StudioTeam.mp4). The mobile slot
   reuses the same landscape master for now — object-cover center-crops
   it to 9:16, acceptable until a portrait re-cut exists. When ready,
   drop into /public/video/:
     • StudioTeam-mobile.mp4   1080×1920 (9:16) portrait re-cut
     • StudioTeam-poster.jpg / StudioTeam-poster-mobile.jpg
   and update the constants below. No other change needed.
   ─────────────────────────────────────────────────────────────────────── */

const VIDEO_DESKTOP = '/video/StudioTeam.mp4';
const VIDEO_MOBILE = '/video/StudioTeam.mp4'; // REPLACE: /video/StudioTeam-mobile.mp4 (1080×1920)
const POSTER_DESKTOP = '/video/intro-poster.jpg'; // REPLACE: /video/StudioTeam-poster.jpg
const POSTER_MOBILE = '/video/intro-poster.jpg'; // REPLACE: /video/StudioTeam-poster-mobile.jpg

export function AboutStudioVideo() {
  const isDesktop = useIsDesktop();
  const src = isDesktop ? VIDEO_DESKTOP : VIDEO_MOBILE;
  const poster = isDesktop ? POSTER_DESKTOP : POSTER_MOBILE;

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-[0_0_80px_-30px_rgba(124,58,237,0.5)] md:aspect-video md:max-w-none">
      <video
        // Remount when the viewport class flips so the browser picks up
        // the new source (e.g. device rotation crossing the breakpoint).
        key={src + (isDesktop ? '-d' : '-m')}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className="h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Soft bottom vignette so the frame sits in the page's palette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/70 to-transparent" />
    </div>
  );
}
