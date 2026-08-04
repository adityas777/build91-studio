'use client';

import { Fragment, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ───────────────────────────────────────────────────────────────────────
   StoryTimeline — the "Our Story" milestone slider on /about
   ───────────────────────────────────────────────────────────────────────
   Replaces the static 3-card year grid. One large card is visible at a
   time and auto-advances every ~5s:

     2023 ━━━━━━━━━ 2024 ────────── 2025      ← year rail (clickable)
     ┌─────────────────────────────────────┐
     │  Founded                      ₂₀₂₃  │  ← card, ghost year behind
     │  Started as a pure 3D…              │
     └─────────────────────────────────────┘

   • The connector after the active year fills left→right over the hold
     time — a quiet countdown to the next slide.
   • Hover (or touch on the card) pauses auto-advance, mirrors
     Testimonials' pause behaviour.
   • prefers-reduced-motion: no auto-advance, no fill animation — the rail
     becomes a plain manual tab switcher.
   ─────────────────────────────────────────────────────────────────────── */

export type StoryMilestone = {
  year: string;
  title: string;
  copy: string;
};

const ROTATE_MS = 5000;

export function StoryTimeline({ milestones }: { milestones: StoryMilestone[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(
      () => setActive((n) => (n + 1) % milestones.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [paused, reducedMotion, milestones.length]);

  const m = milestones[active];

  return (
    <div
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* ── Year rail ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 md:gap-4">
        {milestones.map((item, i) => {
          const isActive = i === active;
          return (
            <Fragment key={item.year}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${item.year} — ${item.title}`}
                aria-current={isActive}
                className={`text-display rounded-full border px-4 py-1.5 text-sm font-semibold tabular-nums transition-all md:px-5 md:text-base ${
                  isActive
                    ? 'border-gold/50 bg-gold/[0.08] text-gold shadow-[0_0_24px_-8px_rgba(224,184,114,0.6)]'
                    : 'border-white/10 bg-white/[0.02] text-white/45 hover:border-white/25 hover:text-white'
                }`}
              >
                {item.year}
              </button>

              {/* Connector — the one after the active year doubles as the
                  auto-advance countdown fill. */}
              {i < milestones.length - 1 && (
                <div
                  aria-hidden
                  className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10"
                >
                  {isActive && !reducedMotion && !paused && (
                    <motion.div
                      key={`fill-${active}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                      className="absolute inset-0 origin-left bg-gradient-to-r from-gold to-violet-glow"
                    />
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* ── Sliding card ───────────────────────────────────────────── */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md md:mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[230px] p-7 sm:min-h-[200px] md:min-h-[190px] md:p-10"
          >
            {/* Giant ghost year behind the copy */}
            <span
              aria-hidden
              className="text-display pointer-events-none absolute -top-4 right-2 select-none text-[5.5rem] font-bold leading-none text-white/[0.05] md:-top-6 md:right-4 md:text-[9rem]"
            >
              {m.year}
            </span>

            <div className="relative max-w-md">
              <div className="text-display text-sm tracking-[0.3em] text-violet-soft">
                {m.year}
              </div>
              <h3 className="text-display mt-3 text-2xl font-semibold md:mt-4 md:text-3xl">
                {m.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
                {m.copy}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Gold accent edge, mirrors the active-year glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
      </div>
    </div>
  );
}
