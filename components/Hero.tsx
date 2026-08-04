'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const headline = ['From', 'Blueprint', 'to', 'Buyer.'];

/* ── Digit scramble hook ────────────────────────────────────────────────────
   Each digit position cycles through random 0-9 glyphs at ~55ms ticks and
   locks into its final value, left-to-right, over the given duration.
   Single-digit values scramble for the full duration before locking.
*/
function useDigitScramble(
  finalValue: number,
  triggered: boolean,
  duration = 900,
  delay = 0,
) {
  const finalStr = String(finalValue);
  const [display, setDisplay] = useState(() => '0'.repeat(finalStr.length));
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!triggered) {
      setDisplay('0'.repeat(finalStr.length));
      setLocked(false);
      return;
    }

    let raf = 0;
    let startTs = 0;
    let lastTick = 0;
    const TICK_MS = 55; // gap between random-digit swaps

    const tick = (ts: number) => {
      if (!startTs) {
        startTs = ts + delay;
        lastTick = ts + delay;
      }
      if (ts < startTs) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);

      if (ts - lastTick >= TICK_MS || progress >= 1) {
        lastTick = ts;

        // First digit locks at 60% of duration, last digit at 100%.
        // Single-digit values lock only at the very end.
        const SCRAMBLE_BASE = 0.6;
        const SCRAMBLE_SPAN = 0.4;

        const next = finalStr
          .split('')
          .map((d, i) => {
            if (!/\d/.test(d)) return d;
            const lockAt =
              finalStr.length === 1
                ? 1
                : SCRAMBLE_BASE + (i / (finalStr.length - 1)) * SCRAMBLE_SPAN;
            if (progress >= lockAt) return d;
            return String(Math.floor(Math.random() * 10));
          })
          .join('');

        setDisplay(next);
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(finalStr);
        setLocked(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [triggered, finalValue, duration, delay, finalStr]);

  return { display, locked };
}

/* ── Individual animated stat ──────────────────────────────────────────────── */
interface StatProps {
  end: number;
  suffix?: string;
  label: string;
  delay?: number;        // stagger delay in ms
  duration?: number;
  triggered: boolean;
}

const ENTRY_MS = 320; // entry fade duration — scramble starts after this

function AnimatedStat({ end, suffix = '', label, delay = 0, duration = 1700, triggered }: StatProps) {
  // Arm the scramble only AFTER the entry fade has completed so the churn
  // happens against a fully-opaque, sharp number (otherwise it's invisible
  // behind the fade-in).
  const [scrambleArm, setScrambleArm] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    const t = setTimeout(() => setScrambleArm(true), delay + ENTRY_MS);
    return () => clearTimeout(t);
  }, [triggered, delay]);

  const { display, locked } = useDigitScramble(end, scrambleArm, duration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={triggered ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: ENTRY_MS / 1000, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative inline-block">
        {/* Lock-in glow flash — fires behind the number when it settles */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-2xl bg-violet-glow/60 blur-2xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={locked ? { opacity: [0, 0.9, 0], scale: [0.5, 1.4, 1.7] } : {}}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
        <motion.div
          className="text-display relative text-3xl font-semibold tabular-nums md:text-4xl"
          animate={
            locked
              ? { scale: [1, 1.18, 1], color: ['#C4B5FD', '#FFFFFF', '#FFFFFF'] }
              : scrambleArm
                ? { color: '#C4B5FD' }
                : { color: '#FFFFFF' }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {display}
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: locked ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="inline-block"
          >
            {suffix}
          </motion.span>
        </motion.div>
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
        {label}
      </div>
      {/* Screen-reader value — always the final number */}
      <span className="sr-only">{end}{suffix} {label}</span>
    </motion.div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
const STATS: Omit<StatProps, 'triggered'>[] = [
  { end: 120,  suffix: '+', label: 'Projects Delivered', delay: 0,   duration: 1800 },
  { end: 3,                 label: 'Countries Served',    delay: 180, duration: 1600 },
  { end: 5,                 label: 'Service Pillars',     delay: 360, duration: 1600 },
  { end: 2026,              label: 'Built for Today',     delay: 540, duration: 2000 },
];

export function Hero() {
  const stripRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stripRef, { once: true, amount: 0.5 });

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10 bg-mesh animated-gradient" />
      <div className="absolute inset-0 -z-10 bg-grid-soft opacity-50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-900/30 via-transparent to-ink-900" />

      {/* Floating glow orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/30 blur-[120px]"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-gold/20 blur-[140px]"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-page relative w-full pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70 backdrop-blur-md"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-glow" />
          The Complete Digital Sales Suite
        </motion.div>

        <h1 className="text-display flex flex-wrap gap-x-4 gap-y-2 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[6.5rem]">
          {headline.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                word === 'Blueprint'
                  ? 'text-accent-italic font-normal text-gradient'
                  : word === 'Buyer.'
                    ? 'text-gradient-gold'
                    : 'text-white'
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
        >
          We build the digital experiences that sell real estate before it exists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Link href="#work" className="btn-primary group">
            Explore Our Work
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Link>
          <Link href="/contact" className="btn-secondary group">
            Get in Touch
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Metric strip */}
        <motion.div
          ref={stripRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.25 }}
          className="mt-20 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <AnimatedStat key={s.label} {...s} triggered={inView} />
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-xs uppercase tracking-[0.3em] text-white/40" />
        <div className="relative h-10 w-[1px] overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 block h-3 w-[1px] animate-scroll-indicator bg-violet-soft" />
        </div>
      </div>
    </section>
  );
}
