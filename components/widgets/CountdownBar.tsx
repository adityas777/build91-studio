'use client';

import { useEffect, useState } from 'react';
import { AVG_LAUNCH_DAYS, LAUNCH_MILESTONES } from '@/lib/outcomes';

/* ───────────────────────────────────────────────────────────────────────
   CountdownBar — animated Day 0 → Day AVG_LAUNCH_DAYS launch-sprint walk
   ───────────────────────────────────────────────────────────────────────
   Bar fills left-to-right over LOOP_MS, then resets and loops. The day
   counter increments in lockstep, and the subtitle swaps to the most
   recent micro-milestone at-or-before the current day. Both the day
   ceiling and the milestone list live in `lib/outcomes.ts` so studio
   sign-off + copy edits stay a single-file change.

   ── Mobile reliability note ──────────────────────────────────────────
   An earlier version used `useInView` + `requestAnimationFrame`. On iOS
   Safari and a couple of Android browsers, that combo wouldn't tick on
   initial mount and only started after a tab-blur/focus cycle (the
   `visibilitychange` event nudged the IntersectionObserver to re-fire).
   This rewrite avoids both:
     • Plain `setInterval` (immune to rAF throttling and visibility-API
       gotchas, ticks reliably while the page is foreground)
     • No `useInView` gate — the widget is tiny enough that running its
       timer unconditionally has negligible cost
   Reduced-motion still short-circuits to the final state with no timer.
   ─────────────────────────────────────────────────────────────────────── */

// 30-day arc over 24s → ~800ms per day, ~1.6s avg dwell per milestone.
// Keep LOOP_MS / AVG_LAUNCH_DAYS >= ~600ms so labels stay readable.
const LOOP_MS = 14000;
const TICK_MS = 30; // ~17fps; CSS transition smooths the bar between ticks

function milestoneFor(day: number): string {
  for (let i = LAUNCH_MILESTONES.length - 1; i >= 0; i--) {
    if (day >= LAUNCH_MILESTONES[i].day) return LAUNCH_MILESTONES[i].label;
  }
  return LAUNCH_MILESTONES[0].label;
}

export function CountdownBar() {
  const [progress, setProgress] = useState(0); // 0 → 1
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
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - start;
      setProgress((elapsed % LOOP_MS) / LOOP_MS);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const dayContinuous = progress * AVG_LAUNCH_DAYS;
  // Math.floor (not round) so each integer day "owns" its full ~800ms slot
  // before the counter steps up — no jitter at half-day boundaries.
  const day = reducedMotion
    ? AVG_LAUNCH_DAYS
    : Math.min(AVG_LAUNCH_DAYS, Math.floor(dayContinuous));
  const label = milestoneFor(day);

  return (
    <div className="relative flex min-h-[11rem] flex-col justify-between rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(224,184,114,0.06)_0%,rgba(10,8,32,0.6)_100%)] p-5 md:h-full md:min-h-0 md:[grid-area:countdown]">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-soft">
          Launch-to-live · {AVG_LAUNCH_DAYS} days
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-display text-sm font-medium uppercase tracking-[0.2em] text-white/55">
            Day
          </span>
          <span className="text-display text-4xl font-semibold tabular-nums text-white md:text-5xl">
            {day}
          </span>
        </div>
        <p
          aria-live="polite"
          className="text-display mt-2 text-sm font-medium leading-snug text-gold-soft md:text-base"
        >
          {label}
        </p>
      </div>

      {/* Fill bar — left to right, 0 → 100% over LOOP_MS, then loops. */}
      <div className="mt-4">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-soft"
            style={{
              width: `${progress * 100}%`,
              transitionProperty: reducedMotion ? 'none' : 'width',
              transitionDuration: `${TICK_MS}ms`,
              transitionTimingFunction: 'linear',
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-white/35">
          <span>Day 0</span>
          <span>Day {AVG_LAUNCH_DAYS}</span>
        </div>
      </div>
    </div>
  );
}
