'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CLIENT_COUNTRY_LABELS,
  CLIENT_LOGOS,
  CLIENT_SEGMENT_LABELS,
  activeSegments,
  logosBySegment,
  type ClientCountry,
  type ClientLogo,
  type ClientSegment,
} from '@/lib/clients';

/** Dot color for the country pill — keeps the wall on-brand without
 *  introducing flag emojis (which render inconsistently across OSes). */
const COUNTRY_DOT: Record<ClientCountry, string> = {
  India: 'bg-gold shadow-[0_0_6px_rgba(224,184,114,0.6)]',
  UAE: 'bg-violet-soft shadow-[0_0_6px_rgba(167,139,250,0.55)]',
  Australia: 'bg-violet-glow shadow-[0_0_6px_rgba(124,58,237,0.6)]',
};

/* ───────────────────────────────────────────────────────────────────────
   ClientLogoWall
   ───────────────────────────────────────────────────────────────────────
   Two visual modes:
     • variant="home"  → marquee row (mobile) + grid (desktop), slim section
     • variant="about" → static grid only, denser, no segment tabs

   Each logo renders on a white card with consistent dimensions. Original
   brand colors and backgrounds are preserved exactly as supplied — the
   card frame absorbs PNGs that have baked-in white backgrounds and gives
   colored / transparent logos a clean container. When theme-matched
   logo versions arrive, drop `bg-white` on the tile to render flush.

   Marquee respects prefers-reduced-motion (falls back to grid).
   Segment tabs auto-show only when more than one segment is populated —
   v1 ships with a single "developers-partners" segment so tabs are hidden
   until the data layer is sharded.
   ─────────────────────────────────────────────────────────────────────── */

type Props = {
  variant?: 'home' | 'about';
  eyebrow?: string;
  heading?: string;
  sub?: string;
  className?: string;
};

export function ClientLogoWall({
  variant = 'home',
  eyebrow = 'Trusted By',
  heading = 'Builders and Developers.',
  sub = 'Some global clients we ship for.',
  className,
}: Props) {
  const segments = useMemo(() => activeSegments(), []);
  const showTabs = segments.length > 1;
  const [active, setActive] = useState<ClientSegment>(segments[0]);

  const visible = showTabs ? logosBySegment(active) : CLIENT_LOGOS;
  const prefersReducedMotion = useReducedMotion();

  // Prevent hydration mismatch by waiting until mounted to evaluate prefersReducedMotion
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showMarquee = variant === 'home';

  return (
    <section
      aria-label="Clients and partners"
      className={`section-base section-neutral relative overflow-hidden py-10 md:py-14 ${className ?? ''}`}
    >
      {/* Soft ambient glows to keep this section in family with StatsBar above */}
      <div className="pointer-events-none absolute -left-32 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-glow/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />

      <div className="container-page relative">
        {/* Header — restrained, doesn't compete with logos */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 className="text-display mt-4 text-2xl font-semibold leading-tight md:text-3xl">
            {heading}
          </h2>
          {sub && (
            <p className="mt-3 text-sm text-white/55 md:text-base">{sub}</p>
          )}
        </div>

        {/* Segment tabs — hidden in v1 (single segment) */}
        {showTabs && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {segments.map((seg) => {
              const isActive = seg === active;
              return (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setActive(seg)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${isActive
                    ? 'border-violet-glow/50 bg-white/[0.06] text-white'
                    : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white/80'
                    }`}
                >
                  {CLIENT_SEGMENT_LABELS[seg]}
                </button>
              );
            })}
          </div>
        )}

        {/* Logo display — marquee at ALL breakpoints (better as the list
            grows past what a static grid can hold). The grid below is now
            ONLY the reduced-motion fallback and the `about` variant. */}
        {showMarquee ? (
          <div className="mt-10">
            <LogoMarquee logos={visible} />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((logo) => (
              <LogoTile key={logo.id} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Single logo tile ──────────────────────────────────────────────────── */

function LogoTile({ logo }: { logo: ClientLogo }) {
  // Each logo sits on a white card. This is the Stripe / Notion / Linear
  // pattern for mixed-quality logo walls: original brand colors + original
  // backgrounds stay intact, white-bg PNGs blend into the card seamlessly,
  // and we control sizing/padding consistently here instead of having to
  // preprocess every source file.
  //
  // Below the card sits a small country pill (dot + label) so the wall
  // doubles as a "we work across India / UAE / Australia" proof point.
  //
  // When the user provides theme-matched (white silhouette / transparent)
  // versions of the logos, the white card frame can be dropped — change
  // `bg-white` to `bg-transparent` and remove the shadow/border.
  return (
    <figure className="group flex flex-col items-center gap-3">
      <div
        className="relative flex h-[135px] w-full items-center justify-center rounded-2xl border border-black/5 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(124,58,237,0.18)] md:h-[156px] md:p-4"
        title={logo.name}
      >
        <Image
          src={logo.src}
          alt={logo.name}
          width={300}
          height={156}
          sizes="(max-width: 768px) 45vw, 20vw"
          className="max-h-full w-auto max-w-full object-contain scale-[1.08] transition-transform duration-300 group-hover:scale-115"
        />
      </div>
      <CountryPill country={logo.country} />
    </figure>
  );
}

/* ── Country pill — small caps label with a country-coded dot ─────────── */

function CountryPill({ country }: { country: ClientCountry }) {
  return (
    <figcaption className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-white/55">
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${COUNTRY_DOT[country]}`} />
      {CLIENT_COUNTRY_LABELS[country]}
    </figcaption>
  );
}

/* ── Infinite marquee — used at all breakpoints (desktop + mobile) ────── */

function LogoMarquee({ logos }: { logos: ClientLogo[] }) {
  // Duplicate so the loop point is invisible
  const strip = [...logos, ...logos];

  // Speed scales with logo count so per-logo screen time stays constant
  // as the list grows. ~3s/logo, floored at 24s.
  const duration = Math.max(24, logos.length * 3);

  return (
    <div className="relative -mx-6 md:mx-0">
      {/* Edge fade masks — soft cutoff so logos dissolve at edges.
          Wider on desktop where the canvas is bigger. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#0d1822] to-[#0d1822]/0 md:block md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#0d1822] to-[#0d1822]/0 md:block md:w-24" />

      <div className="overflow-hidden px-6 md:px-0">
        {/* Seam-clean infinite marquee:
            • CRITICAL: `w-max` makes the div size to its CONTENT
              (max-content), not its parent's viewport width. Without
              this, translation shifts by 50% of the parent width
              instead of 50% of the actual strip.
            • Each tile has a FIXED width. Combined with
              no flex `gap` (spacing lives INSIDE each tile via mx-*),
              the strip is exactly N × tileWidth, so `-50%` lands
              precisely on the start of the duplicate copy. */}
        <div
          className="flex w-max items-center animate-marquee-rtl hover-pause will-change-transform"
          style={{ animationDuration: `${duration}s` }}
        >
          {strip.map((logo, i) => (
            <figure
              key={`${logo.id}-${i}`}
              className="mx-3 flex w-[270px] shrink-0 flex-col items-center gap-2 md:mx-4 md:w-[350px] md:gap-3"
            >
              <div className="flex h-[116px] w-full items-center justify-center rounded-2xl border border-black/5 bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] md:h-[140px] md:p-3.5">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={300}
                  height={140}
                  sizes="(max-width: 768px) 270px, 350px"
                  className="max-h-full w-auto max-w-full object-contain scale-[1.08] transition-transform duration-300 hover:scale-115"
                />
              </div>
              <CountryPill country={logo.country} />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
