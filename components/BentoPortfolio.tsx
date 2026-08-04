'use client';

import { useMemo, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PORTFOLIO_ITEMS } from '@/lib/portfolioData';
import { SelfHostedReelCard } from './SelfHostedReelCard';
import { AnimatedSection } from './AnimatedSection';

const REEL_LIMIT = 8;

/**
 * BentoPortfolio — Selected Work strip of self-hosted reels.
 *
 * Horizontal-scroll strip of vertical 9:16 cards. Each card backed by a
 * local MP4 that autoplays muted as the card enters the viewport (TikTok
 * feed feel). Click to unmute.
 *
 * Native browser scrollbar is kept visible (thin themed track) so users
 * see there's more to swipe. The full /work index lives at /work and can
 * present richer detail.
 */
export function BentoPortfolio() {
  const stripRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => PORTFOLIO_ITEMS.filter((i) => i.featured).slice(0, REEL_LIMIT),
    [],
  );

  function scrollStrip(dir: -1 | 1) {
    if (!stripRef.current) return;
    const w = stripRef.current.clientWidth;
    stripRef.current.scrollBy({ left: dir * w * 0.85, behavior: 'smooth' });
  }

  return (
    <section
      id="work"
      className="section-base section-neutral relative overflow-hidden py-28 md:py-36"
    >
      <div className="container-page">
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
            href="/work"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-white/80 transition-colors hover:text-gold md:self-end"
          >
            View All Work
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>

        {/* ── Horizontal-scroll featured reel ──────────────────────────── */}
        <AnimatedSection>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
              Featured Reel
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

          {/* Native scrollbar kept visible (themed thin track) — affordance
              that there's more content to the right. */}
          <div
            ref={stripRef}
            className="thin-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 md:mx-0 md:px-0"
          >
            {items.map((item) => (
              <SelfHostedReelCard key={item.id} item={item} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
