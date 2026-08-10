'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';
import { InstagramReelCard } from './InstagramReelCard';
import { ReelLightbox } from './ReelLightbox';
import type { Reel } from '@/lib/instagram';
import { SITE } from '@/lib/constants';

/* ───────────────────────────────────────────────────────────────────────
   SelectedWorkClient — horizontal scroll strip of IG reels
   ───────────────────────────────────────────────────────────────────────
   Receives the pre-fetched `reels` array from <SelectedWork /> (server).
   Owns only the modal open/close state, click navigation, and the strip
   scroll-by-arrow behaviour. No fetching.

   ── Why a horizontal strip, not a grid? ────────────────────────────
   The earlier BentoPortfolio used a horizontal scroll strip — this
   matches that visual rhythm exactly so the page IA + scrolling muscle
   memory stays identical. A grid of 8 thumbnails reads as catalog;
   a horizontal strip of 8 vertical reels reads as feed — which is
   what the studio's IG actually is.

   Each card autoplays muted as it enters the viewport (TikTok feel).
   Click opens the lightbox where sound + native controls take over.

   ── Why not auto-advance the strip? ────────────────────────────────
   Auto-advancing horizontal strips fight the user's own scrolling and
   typically tank dwell time. The cards already have continuous in-card
   motion (the videos), and the native thin scrollbar plus chevron
   buttons telegraph "more to the right" — that's enough affordance.
   ─────────────────────────────────────────────────────────────────────── */

export function SelectedWorkClient({ reels }: { reels: Reel[] }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      setScale(width / 1920);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const open = useCallback((i: number) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const navigate = useCallback(
    (delta: 1 | -1) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        const next = current + delta;
        if (next < 0 || next >= reels.length) return current;
        return next;
      });
    },
    [reels.length],
  );

  function scrollStrip(dir: -1 | 1) {
    if (!stripRef.current) return;
    const w = stripRef.current.clientWidth;
    stripRef.current.scrollBy({ left: dir * w * 0.85, behavior: 'smooth' });
  }

  if (reels.length === 0) return null;

  return (
    <section
      id="work"
      className="section-base section-neutral relative overflow-hidden py-16 md:py-36"
    >
      <div className="container-page">
        {/* ── Header ────────────────────────────────────────────────── */}
        <AnimatedSection className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Selected Work</span>
            <h2 className="section-heading mt-4">
              A glimpse of{' '}
              <span className="text-accent-italic text-gradient">
                work in the wild.
              </span>
            </h2>
          </div>
          <Link
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-white/80 transition-colors hover:text-gold md:self-end"
          >
            View on Instagram
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>

        {/* ── Strip ─────────────────────────────────────────────────── */}
        <AnimatedSection>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
              From the studio Instagram
              <span aria-hidden className="text-white/35">·</span>
              <span className="text-white/60">Swipe / scroll →</span>
            </span>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll left"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-violet-glow/50 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Scroll right"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:border-violet-glow/50 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Native scrollbar kept visible (themed thin track) so the
              affordance for "more content to the right" is obvious. */}
          <div
            ref={stripRef}
            className="thin-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 md:mx-0 md:px-0"
          >
            {reels.map((reel, i) => (
              <InstagramReelCard
                key={reel.id}
                reel={reel}
                index={i}
                onOpen={() => open(i)}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* ── 3D Virtual Tour Embed ──────────────────────────────────── */}
      <AnimatedSection className="w-full mt-12 md:mt-20">
        <div
          ref={containerRef}
          className="relative w-full border-y border-white/10 bg-black/20 shadow-2xl overflow-hidden"
          style={{ height: `${1080 * scale}px` }}
        >
          <iframe
            src="https://demo.build91.in/3BHK-Tour/index.htm"
            className="absolute border-0"
            style={{
              width: '1920px',
              height: '1080px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              left: 0,
              top: 0,
            }}
            allowFullScreen
            loading="lazy"
            title="Build91 Studio 3D Virtual Tour"
          />
        </div>
      </AnimatedSection>

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <ReelLightbox
          reels={reels}
          index={lightboxIndex}
          onClose={close}
          onNavigate={navigate}
        />
      )}
    </section>
  );
}
