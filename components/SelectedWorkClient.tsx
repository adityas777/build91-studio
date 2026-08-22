'use client';

import { useCallback, useRef, useState } from 'react';
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      className="section-base section-neutral relative overflow-hidden py-10 md:py-16"
    >
      <div className="container-page">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <AnimatedSection className="flex flex-col gap-3 max-w-2xl">
            <div>
              <span className="section-eyebrow">Selected Work</span>
              <h2 className="section-heading mt-3">
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
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-gold w-fit"
            >
              View on Instagram
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>

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

        {/* ── Strip ─────────────────────────────────────────────────── */}
        <AnimatedSection>

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
