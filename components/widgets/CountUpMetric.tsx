'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { BOOKINGS_SUPPORTED_CR } from '@/lib/outcomes';

/* ───────────────────────────────────────────────────────────────────────
   CountUpMetric — scroll-triggered count-up to BOOKINGS_SUPPORTED_CR
   ───────────────────────────────────────────────────────────────────────
   Lock-in animation matching the StatsBar feel (ease-out cubic, ~1.8s).
   Counts once on first viewport entry, then stays static — no continuous
   motion (the bar/map widgets carry the "page stays alive" duty).

   Reduced-motion: jumps straight to the final value.
   ─────────────────────────────────────────────────────────────────────── */

const DURATION = 1800;

export function CountUpMetric() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(BOOKINGS_SUPPORTED_CR);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(eased * BOOKINGS_SUPPORTED_CR));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion]);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[11rem] flex-col justify-between rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(124,58,237,0.10)_0%,rgba(10,8,32,0.6)_100%)] p-5 md:h-full md:min-h-0 md:[grid-area:metric]"
    >
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
          Bookings supported
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-display text-2xl font-medium text-white/80 md:text-3xl">
            ₹
          </span>
          <span className="text-display text-4xl font-semibold tabular-nums tracking-tight text-white md:text-5xl">
            {value}
          </span>
          <span className="text-display ml-0.5 bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-2xl font-semibold text-transparent md:text-3xl">
            cr+
          </span>
        </div>
        <p className="mt-2 text-xs text-white/55">
          Aggregate value across launches we&rsquo;ve produced creative for
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
        <span className="h-px w-6 bg-gradient-to-r from-gold to-transparent" />
        Last 18 months
      </div>
    </div>
  );
}
