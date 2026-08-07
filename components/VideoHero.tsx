'use client';

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { useIsDesktop } from '@/lib/useMediaQuery';

/**
 * VideoHero — full-viewport cinematic showreel.
 *
 * The video plays continuously in the background; a single rotating tagline
 * cross-fades through a few short statements so the visuals get center stage.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ASSET SWAP — TWO VERSIONS REQUIRED                                  │
 * │                                                                     │
 * │ Aspect mismatch is severe here (16:9 desktop vs 9:19 portrait), so │
 * │ a single landscape master crops to ~35% of frame on phones. Author │
 * │ a separate portrait re-cut featuring vertical-friendly shots:      │
 * │ close-ups, top-down drone, vertical pans.                          │
 * │                                                                     │
 * │ Required files (drop into /public/video/):                          │
 * │   • hero-reel.mp4         1920×1080 (16:9)   ~3-5 MB, 15-25s loop  │
 * │   • hero-reel-mobile.mp4  1080×1920 (9:16)   ~1.5-2.5 MB, same len │
 * │   • hero-poster.jpg       1920×1080 first-frame poster              │
 * │   • hero-poster-mobile.jpg 1080×1920 portrait poster                │
 * │                                                                     │
 * │ Recommended encode (desktop):                                       │
 * │   ffmpeg -i master.mov -an -vf "scale=1920:-2,fps=30" \             │
 * │     -c:v libx264 -crf 22 -preset slow -movflags +faststart \        │
 * │     -pix_fmt yuv420p hero-reel.mp4                                   │
 * │ Mobile (after re-editing to portrait):                              │
 * │   ffmpeg -i master-portrait.mov -an -vf "scale=1080:-2,fps=30" \    │
 * │     -c:v libx264 -crf 24 -preset slow -movflags +faststart \        │
 * │     -pix_fmt yuv420p hero-reel-mobile.mp4                            │
 * │                                                                     │
 * │ Until the new files exist, both sources fall back to the existing  │
 * │ intro-reel-web.mp4 so the page still renders.                       │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// REPLACE: swap these paths once the bespoke encodes land in /public/video/.
const HERO_VIDEO_DESKTOP = '/video/hero-reel-desktop.mp4'; // → /video/hero-reel.mp4
const HERO_VIDEO_MOBILE = '/video/herobanner_fast.mp4'; // → /video/hero-reel-mobile.mp4
const HERO_POSTER_DESKTOP = '/video/hero-poster-desktop.webp';
const HERO_POSTER_MOBILE = '/video/hero-poster-mobile.webp';

// Edit/add taglines here. Every phrase MUST follow the same two-part
// rhythm: a bold lead (concrete category) + an italic-gradient accent
// (aspirational outcome). This keeps the rotation visually consistent.
const TAGLINES: { lead: string; accent: ReactNode }[] = [
  { lead: 'Project Showcases that', accent: 'Sell the Vision.' },
  { lead: 'Immersive', accent: 'Digital Experiences.' },
  { lead: 'End-to-End', accent: 'Marketing Stack.' },
  { lead: 'From Blueprint to', accent: 'Buyer.' },
];

const HOLD_MS = 3400; // time each tagline is fully visible
const FADE_MS = 700; // cross-fade duration

export function VideoHero() {
  const ref = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const videoSrc = isDesktop ? HERO_VIDEO_DESKTOP : HERO_VIDEO_MOBILE;
  
  const [isMounted, setIsMounted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  // Tagline rotation
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((n) => (n + 1) % TAGLINES.length),
      HOLD_MS + FADE_MS,
    );
    return () => clearInterval(id);
  }, []);
  const current = TAGLINES[idx];

  return (
    <section
      ref={ref}
      className="relative isolate flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-ink-900"
    >
      {/* ── Preload link elements (React 18 hoisted to head) ─────────── */}
      <link rel="preload" href={HERO_POSTER_DESKTOP} as="image" media="(min-width: 768px)" />
      <link rel="preload" href={HERO_POSTER_MOBILE} as="image" media="(max-width: 767px)" />

      {/* ── Cinematic Poster Overlay (LCP Candidate) ────────────────── */}
      <div
        className={`absolute inset-0 -z-10 h-full w-full transition-opacity duration-1000 ${
          videoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <picture className="h-full w-full">
          <source media="(min-width: 768px)" srcSet={HERO_POSTER_DESKTOP} />
          <img
            src={HERO_POSTER_MOBILE}
            alt="Build91 Studio Showreel Poster"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* ── Looping showreel ─────────────────────────────────────────── */}
      {isMounted && (
        <motion.div
          style={{ y: videoY }}
          className="absolute inset-0 -z-20 h-[115%] w-full"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setVideoPlaying(true)}
            onPlay={() => setVideoPlaying(true)}
            className="h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </motion.div>
      )}

      {/* ── Cinematic overlays ──────────────────────────────────────── */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/20 to-ink-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,7,26,0.85)_100%)]" />
        <div className="absolute inset-0 bg-grid-soft opacity-30" />
      </motion.div>

      {/* ── Rotating tagline ─────────────────────────────────────────── */}
      <motion.div
        style={{ y: textY }}
        // Desktop: small bottom pad so the tagline sits low in the frame and
        // the video composition stays the hero. Mobile keeps a touch more
        // room above the scroll indicator.
        className="container-page relative w-full pb-20 md:pb-12 lg:pb-14"
      >
        <div
          // Reserve enough vertical space so the layout doesn't reflow as
          // taglines of different lengths swap in and out. Slightly taller
          // than the type height so italic Cormorant descenders (g, p, y)
          // have room to render below the baseline.
          className="relative min-h-[160px] max-w-5xl sm:min-h-[200px] md:min-h-[180px] lg:min-h-[220px]"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={idx}
              initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -22, filter: 'blur(8px)' }}
              transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              // Mobile -30% / desktop -50% from the previous pass.
              //   base 60→40, sm 72→48, md 96→48, lg 120→60, xl 132→66
              className="text-display absolute inset-0 flex flex-col items-start gap-y-1 text-[2.5rem] font-bold leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_2px_30px_rgba(5,7,26,0.55)] sm:text-5xl md:text-5xl lg:text-6xl xl:text-[4.125rem]"
            >
              <span className="block text-white">{current.lead}</span>
              {/* Italic Cormorant has deeper descenders than Space Grotesk —
                  give the accent line its own roomier leading + a touch of
                  bottom padding so 'g', 'p', 'y' aren't clipped. */}
              <span className="text-accent-italic block pb-[0.12em] font-semibold leading-[1.08] text-gradient">
                {current.accent}
              </span>
            </motion.h1>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Scroll indicator ────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
        }
        aria-label="Scroll to next section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-white/55 transition-colors hover:text-white md:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.4em]">
          Scroll
        </span>
        <span className="relative flex h-9 w-[1px] overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 block h-3 w-[1px] animate-scroll-indicator bg-violet-soft" />
        </span>
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </motion.button>
    </section>
  );
}
