'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { ASSET_REEL_ITEMS, type AssetReelItem } from '@/lib/assetReel';

/* ───────────────────────────────────────────────────────────────────────
   AssetReel — atlabs-style horizontal video carousel
   ───────────────────────────────────────────────────────────────────────
   Position #2 on the home page, sitting directly under VideoHero. Acts as
   an instant "look what we make" reveal before the user has scrolled to
   read anything.

   Behaviour:
     • Horizontal scroll-snap row of 4:5 portrait cards
     • Auto-advances one card every ~4.5s while idle
     • User scroll / touch pauses auto-advance for 8s
     • Edge fade masks suggest more content off-screen
     • Each card is a muted, looping HTML5 video (NO audio anywhere)
     • Cards lazy-mount their <video>: only when scrolled into view
       (IntersectionObserver) to cap concurrent decoders
     • Honors prefers-reduced-motion: autoplay off, no auto-scroll,
       videos stay paused on poster frames

   Contrast with BentoPortfolio (which renders further down the page):
     • BentoPortfolio cards are larger 9:16 vertical, click-to-unmute,
       project-led — a curated gallery
     • AssetReel cards are smaller 4:5 portrait, mute-locked, asset-led
       — a capability menu
   They coexist because they answer different questions; visual languages
   are deliberately distinct so the page doesn't feel like "reels twice".

   No section heading by design (matches atlabs minimalism). A small
   eyebrow chip top-left only orients the user.
   ─────────────────────────────────────────────────────────────────────── */

const AUTO_ADVANCE_MS = 4500;
const USER_INTERACTION_GRACE_MS = 8000;

export function AssetReel() {
  return (
    <section
      aria-label="What we make — a menu of asset types"
      className="section-base section-violet relative overflow-hidden border-b border-white/[0.06] py-14 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-[0.18]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-glow/30 to-transparent" />

      <div className="container-page relative">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            What we make
          </span>
          <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.3em]">
            <span className="text-white/55">Swipe / scroll →</span>
            <span className="hidden text-white/40 md:inline">
              <span aria-hidden className="mr-4 text-white/20">|</span>
              Muted previews
            </span>
          </div>
        </div>

        <ReelStrip />
      </div>
    </section>
  );
}

function ReelStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect prefers-reduced-motion once on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-advance loop. Walks the scroll container by one card width every
  // AUTO_ADVANCE_MS, wrapping to 0 when we've scrolled past the end.
  useEffect(() => {
    if (reducedMotion) return;
    const strip = stripRef.current;
    if (!strip) return;

    const interval = setInterval(() => {
      // Skip this tick if the user just interacted.
      if (Date.now() < pauseUntilRef.current) return;
      const cardWidth = (strip.firstElementChild as HTMLElement | null)
        ?.offsetWidth;
      if (!cardWidth) return;
      const gap = 20; // matches gap-5 utility
      const stepX = cardWidth + gap;
      const max = strip.scrollWidth - strip.clientWidth;
      const next =
        strip.scrollLeft + stepX > max - 4 ? 0 : strip.scrollLeft + stepX;
      strip.scrollTo({ left: next, behavior: 'smooth' });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Pause auto-advance when user scrolls/touches the strip.
  function handleUserInteraction() {
    pauseUntilRef.current = Date.now() + USER_INTERACTION_GRACE_MS;
  }

  return (
    <div className="relative">
      {/* Edge fade masks — gradient overlays that hint at more content (hidden on desktop to prevent card shadowing). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-6 z-10 w-12 bg-gradient-to-r from-[#01040b] to-[#01040b]/0 md:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-6 z-10 w-12 bg-gradient-to-l from-[#01040b] to-[#01040b]/0 md:hidden"
      />

      <div
        ref={stripRef}
        onWheel={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        onMouseDown={handleUserInteraction}
        className="thin-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0"
      >
        {ASSET_REEL_ITEMS.map((item) => (
          <ReelCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

const TINT_CLASS: Record<AssetReelItem['tint'], string> = {
  violet: 'shadow-[0_0_60px_-20px_rgba(124,58,237,0.55)]',
  gold: 'shadow-[0_0_60px_-20px_rgba(224,184,114,0.45)]',
  cool: 'shadow-[0_0_60px_-20px_rgba(91,127,222,0.40)]',
  deep: 'shadow-[0_0_60px_-20px_rgba(56,33,142,0.55)]',
};

function ReelCard({ item }: { item: AssetReelItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inView, setInView] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // ── Visibility tracking — start/pause playback as cards scroll ─────
  useEffect(() => {
    if (!cardRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(cardRef.current);
    return () => io.disconnect();
  }, []);

  // Sync play state with visibility. Some browsers reject autoplay if
  // the tab is hidden — we catch and ignore the rejection.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play()
        .then(() => setVideoPlaying(true))
        .catch(() => {
          setVideoPlaying(false);
        });
    } else {
      v.pause();
      setVideoPlaying(false);
    }
  }, [inView]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => setVideoPlaying(true))
        .catch(() => {});
    } else {
      v.pause();
      setVideoPlaying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative aspect-[4/5] w-[68vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-ink-800 sm:w-[36vw] md:w-[16rem] lg:w-[18rem] ${TINT_CLASS[item.tint]}`}
    >
      {/* Poster — visible until video paints, and as a fallback. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.poster}
        alt={`${item.category} — ${item.project}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video — mounted only when the card is in (or near) view. */}
      {inView && (
        <video
          ref={videoRef}
          key={item.id}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setVideoPlaying(true)}
          onPlay={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={item.mediaSrc} type="video/mp4" />
        </video>
      )}

      {/* Play/Pause overlay - visible only when paused/blocked */}
      {!videoPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/10 transition-opacity duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-ink-900/60 text-white backdrop-blur-md">
            <Play className="h-5 w-5 translate-x-[1px] fill-current" />
          </div>
        </div>
      )}

      {/* Full-card click/touch target */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={videoPlaying ? `Pause ${item.project}` : `Play ${item.project}`}
        className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow"
      />

      {/* Top row chips — category (left) + aspect (right) */}
      <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-ink-900/55 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
        {item.category}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-ink-900/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur-md">
        {item.aspect}
      </span>

      {/* Bottom caption — project + production specs */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent p-3">
        <div className="text-display text-sm font-semibold leading-tight text-white md:text-[15px]">
          {item.project}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80 border border-white/5 animate-none">
            {item.duration}
          </span>
          <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80 border border-white/5 animate-none">
            {item.shipped}
          </span>
        </div>
      </div>

      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-2xl ring-0 ring-violet-glow/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-violet-glow/40" />
    </div>
  );
}
