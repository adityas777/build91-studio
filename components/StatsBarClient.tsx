'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ───────────────────────────────────────────────────────────────────────
   StatsBarClient — animated credentials strip with live Google rating
   ───────────────────────────────────────────────────────────────────────
   Three cells, all sharing the same lock-in animation vocabulary
   (count-up → gold glow pulse → gold underline draw-in):

     1. Google Rating  — DYNAMIC, fetched server-side, fed in as prop.
                          Whole cell clickable, opens Maps listing.
                          Has a filled gold star + tiny Google "G" in
                          the eyebrow label for ToS attribution.
     2. Projects Delivered — 300+
     3. Clients Served     — 120+

   ── Why 3 cells, not 4? ──────────────────────────────────────────────
   The previous 4-stat strip (drone/tours/walkthroughs/projects) read
   as "things we make a lot of." The new 3-stat strip pivots to "things
   that matter to a buyer": independent rating + delivered scale +
   client base. Punchier signal-per-pixel.

   ── Layout ───────────────────────────────────────────────────────────
   `grid-cols-3` on every viewport. Mobile shrinks the font so all three
   fit in one row — keeps the band compact and reads as a single
   "credentials line." Stacking on mobile would have made the section
   tall and lost the strip's rhythm.
   ─────────────────────────────────────────────────────────────────────── */

type CountStat = {
  kind: 'count';
  end: number;
  suffix: string;
  label: string;
};

type RatingStat = {
  kind: 'rating';
  rating: number;
  mapsUrl: string;
  label: string;
};

type Stat = CountStat | RatingStat;

type Props = {
  rating: number;
  mapsUrl: string;
};

// CONFIRM: studio-confirmed numbers. The Google rating is dynamic; the
// other two are quarterly-edit constants — keep accurate.
const PROJECTS_DELIVERED = 300;
const CLIENTS_SERVED = 120;

export function StatsBarClient({ rating, mapsUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const stats: Stat[] = [
    { kind: 'rating', rating, mapsUrl, label: 'Google Rating' },
    {
      kind: 'count',
      end: PROJECTS_DELIVERED,
      suffix: '+',
      label: 'Projects Delivered',
    },
    {
      kind: 'count',
      end: CLIENTS_SERVED,
      suffix: '+',
      label: 'Clients Served',
    },
  ];

  return (
    <section
      aria-label="Studio credentials"
      className="section-base relative overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,#0A0820_0%,#0E0A2C_50%,#0A0820_100%)] py-12 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-25" />
      <div className="pointer-events-none absolute -left-32 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-glow/12 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <div ref={ref} className="container-page relative">
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:gap-x-8">
          {stats.map((s, i) => (
            <StatCell
              key={s.label}
              stat={s}
              trigger={inView}
              delay={i * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCell({
  stat,
  trigger,
  delay,
}: {
  stat: Stat;
  trigger: boolean;
  delay: number;
}) {
  if (stat.kind === 'rating') {
    return <RatingCell stat={stat} trigger={trigger} delay={delay} />;
  }
  return <CountCell stat={stat} trigger={trigger} delay={delay} />;
}

/* ─── Count cell — integers with a "+" suffix (Projects, Clients) ──── */

function CountCell({
  stat,
  trigger,
  delay,
}: {
  stat: CountStat;
  trigger: boolean;
  delay: number;
}) {
  const [value, setValue] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const startDelay = setTimeout(() => {
      const start = performance.now();
      const duration = 1800;
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * stat.end));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setLocked(true);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(startDelay);
  }, [trigger, delay, stat.end]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={trigger ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-2xl bg-gold/35 blur-2xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={locked ? { opacity: [0, 0.7, 0], scale: [0.6, 1.3, 1.6] } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="text-display relative text-3xl font-semibold tabular-nums tracking-tight text-white md:text-5xl lg:text-6xl">
          {value.toLocaleString()}
          <span className="ml-0.5 bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">
            {stat.suffix}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/55 md:text-xs md:tracking-[0.28em]">
        {stat.label}
      </div>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={locked ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 block h-px w-12 origin-center bg-gradient-to-r from-gold to-transparent md:w-14"
      />
      <span className="sr-only">
        {stat.end.toLocaleString()}
        {stat.suffix} {stat.label}
      </span>
    </motion.div>
  );
}

/* ─── Rating cell — clickable, decimal count-up, filled gold star ─── */

function RatingCell({
  stat,
  trigger,
  delay,
}: {
  stat: RatingStat;
  trigger: boolean;
  delay: number;
}) {
  const [value, setValue] = useState(0);
  const [locked, setLocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!trigger) return;
    if (reducedMotion) {
      setValue(stat.rating);
      setLocked(true);
      return;
    }
    const startDelay = setTimeout(() => {
      const start = performance.now();
      const duration = 1800;
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        // Keep ONE decimal of precision throughout — looks more "live"
        // than rounding to integer mid-animation.
        setValue(Math.round(eased * stat.rating * 10) / 10);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setLocked(true);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(startDelay);
  }, [trigger, delay, stat.rating, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={trigger ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <Link
        href={stat.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`See Build91 Studio on Google Maps — rated ${stat.rating} out of 5`}
        className="group flex flex-col items-center text-center transition-transform duration-300 hover:scale-[1.04]"
      >
        <div className="relative">
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-2xl bg-gold/40 blur-2xl"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              locked && !reducedMotion
                ? { opacity: [0, 0.75, 0], scale: [0.6, 1.3, 1.6] }
                : {}
            }
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {/* Persistent low-key halo, brightens on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-2xl bg-gold/15 blur-xl transition-opacity duration-500 group-hover:opacity-150"
          />
          <div className="text-display relative flex items-center gap-1.5 text-3xl font-semibold tabular-nums tracking-tight text-white md:gap-2 md:text-5xl lg:text-6xl">
            {value.toFixed(1)}
            <Star
              className="h-6 w-6 fill-current text-gold drop-shadow-[0_0_8px_rgba(224,184,114,0.55)] md:h-9 md:w-9 lg:h-11 lg:w-11"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/55 md:text-xs md:tracking-[0.28em]">
          <GoogleGLogo className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
          <span>{stat.label}</span>
        </div>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={locked ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 block h-px w-12 origin-center bg-gradient-to-r from-gold to-transparent md:w-14"
        />
        <span className="sr-only">
          {stat.rating} out of 5 on Google Maps. Click to view the listing.
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── Inline 4-color Google "G" (ToS attribution next to rating) ───── */

function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Google"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
