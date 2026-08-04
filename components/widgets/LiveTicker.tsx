'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { LIVE_TICKER_STATUS } from '@/lib/outcomes';

/* ───────────────────────────────────────────────────────────────────────
   LiveTicker — rotating one-liner of "what's currently in flight"
   ───────────────────────────────────────────────────────────────────────
   Light, text-only, no charts. Rotates strings every 4s with a soft fade.
   Pauses when off-screen; reduced-motion shows the first item only.
   ─────────────────────────────────────────────────────────────────────── */

const ROTATE_MS = 4000;

export function LiveTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [idx, setIdx] = useState(0);
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
    if (!inView || reducedMotion) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % LIVE_TICKER_STATUS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [inView, reducedMotion]);

  const message = LIVE_TICKER_STATUS[idx];

  return (
    <div
      ref={ref}
      className="relative flex min-h-[10rem] flex-col justify-between rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(46,184,148,0.06)_0%,rgba(10,8,32,0.6)_100%)] p-5 md:h-full md:min-h-0 md:[grid-area:ticker]"
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-2 w-2">
          <span
            className={`absolute inset-0 rounded-full bg-emerald-400/60 ${
              reducedMotion ? '' : 'animate-ping'
            }`}
            aria-hidden
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-300/80">
          Currently in flight
        </span>
      </div>

      <div className="relative mt-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-display text-sm font-medium leading-snug text-white md:text-base"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Studio · live status
      </div>
    </div>
  );
}
