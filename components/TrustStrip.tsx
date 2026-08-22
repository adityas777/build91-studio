'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, PlaneTakeoff, Building2, Lock, type LucideIcon } from 'lucide-react';

/* ───────────────────────────────────────────────────────────────────────
   TrustStrip
   ───────────────────────────────────────────────────────────────────────
   The quiet sibling of StatsBar. Where StatsBar shouts numbers, this row
   whispers credibility — the four things an Indian developer's marketing
   head silently checks before signing.

   Mobile: 2×2 grid (better than horizontal scroll — every pill stays
   tappable, no overflow anxiety).
   Desktop: single row of 4.

   Each pill deep-links to the About page's "Inside the Studio" section
   (/about#studio) — the team/office film. A dedicated Compliance section
   was descoped per owner direction (2026-06-10).
   ─────────────────────────────────────────────────────────────────────── */

type Pill = {
  id: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  /** Anchor used when sales team deep-links to a specific reassurance. */
  anchor: string;
};

const PILLS: Pill[] = [
  {
    id: 'rera',
    icon: ShieldCheck,
    title: 'RERA-Ready',
    sub: 'Every asset ships compliant',
    anchor: '/about#studio',
  },
  {
    id: 'dgca',
    icon: PlaneTakeoff,
    title: 'DGCA-Certified',
    sub: 'Licensed drone capture',
    anchor: '/about#studio',
  },
  {
    id: 'inhouse',
    icon: Building2,
    title: 'In-House Studio',
    sub: 'Your IP stays protected',
    anchor: '/about#studio',
  },
  {
    id: 'nda',
    icon: Lock,
    title: 'NDA Standard',
    sub: 'Pre-launch stays sealed',
    anchor: '/about#studio',
  },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Studio trust signals"
      className="section-base relative overflow-hidden border-b border-white/[0.06] bg-[#070825] py-6 md:py-8"
    >
      {/* Very faint grid wash to tie into StatsBar above */}
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-[0.18]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-glow/40 to-transparent" />

      <div className="container-page relative">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-6">
          {PILLS.map((pill, i) => (
            <TrustPill key={pill.id} pill={pill} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TrustPill({ pill, index }: { pill: Pill; index: number }) {
  const Icon = pill.icon;
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={pill.anchor} className="group flex items-start gap-3">
        <div
          aria-hidden
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-glow/25 bg-violet-glow/[0.08] text-violet-soft transition-colors group-hover:border-violet-glow/50 group-hover:text-white"
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="text-display text-sm font-semibold leading-tight text-white md:text-base">
            {pill.title}
          </div>
          <div className="mt-0.5 text-xs leading-snug text-white/55 md:text-sm">
            {pill.sub}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
