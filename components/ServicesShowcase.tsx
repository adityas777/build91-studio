'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

/**
 * ServicesShowcase — visual-first "show, don't tell" services grid.
 *
 * Each card has a looping background video, a bold service name, a 10-word
 * pitch, and a "See Work →" link revealed on hover.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ASSET SWAP                                                          │
 * │ Each service expects a short (8-15s) silent loop in /public/video/  │
 * │ named per the `videoSrc` below. Until then, the existing            │
 * │ intro-reel-web.mp4 is used everywhere with a unique poster tint     │
 * │ so cards remain visually distinct.                                  │
 * │                                                                     │
 * │ Recommended encode (per loop):                                      │
 * │   ffmpeg -i src.mov -an -t 12 -vf "scale=960:-2,fps=30" \           │
 * │     -c:v libx264 -crf 24 -preset slow -movflags +faststart \        │
 * │     -pix_fmt yuv420p services-<id>.mp4                              │
 * └─────────────────────────────────────────────────────────────────────┘
 */

type ServiceShowcaseItem = {
  id: string;
  eyebrow: string;
  title: string;
  pitch: string; // max ~10 words
  href: string;
  videoSrc: string; // REPLACE with bespoke loop per service
  posterTint: 'violet' | 'gold' | 'deep' | 'cool';
};

const SERVICES: ServiceShowcaseItem[] = [
  {
    id: 'aerial',
    eyebrow: '01 · Project Showcase',
    title: 'Drone & Aerial 360°',
    pitch: 'Cinematic skies and interactive aerial maps of every site.',
    href: '/work?category=project-showcase',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: drone-loop.mp4
    posterTint: 'violet',
  },
  {
    id: 'viz',
    eyebrow: '02 · 3D Visualization',
    title: 'Photoreal Renders',
    pitch: 'Interiors, exteriors and amenities — built before the build.',
    href: '/work?category=3d-visualization',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: renders-loop.mp4
    posterTint: 'gold',
  },
  {
    id: 'walkthroughs',
    eyebrow: '03 · Virtual Experiences',
    title: '3D Walkthroughs',
    pitch: 'Move buyers through the project from any device, anywhere.',
    href: '/work?category=virtual-experiences',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: walkthrough-loop.mp4
    posterTint: 'deep',
  },
  {
    id: 'tours',
    eyebrow: '03 · Virtual Experiences',
    title: 'Virtual 360° Tours',
    pitch: 'Self-navigable tours that turn browsers into believers.',
    href: '/work?category=virtual-experiences',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: tour-loop.mp4
    posterTint: 'cool',
  },
  {
    id: 'marketing',
    eyebrow: '04 · Marketing Stack',
    title: 'Films, Reels & Sites',
    pitch: 'The full performance suite, tuned for conversion, not vanity.',
    href: '/work?category=marketing-stack',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: marketing-loop.mp4
    posterTint: 'violet',
  },
  {
    id: 'launchpad',
    eyebrow: '05 · Digital Launchpad',
    title: 'Project Microsites',
    pitch: 'One immersive URL. Every asset. Your sales team’s superpower.',
    href: '/work?category=digital-launchpad',
    videoSrc: '/video/intro-reel-web.mp4', // REPLACE: microsite-loop.mp4
    posterTint: 'gold',
  },
];

const TINT_OVERLAY: Record<ServiceShowcaseItem['posterTint'], string> = {
  violet:
    'bg-[linear-gradient(160deg,rgba(91,33,182,0.55)_0%,rgba(5,7,26,0.85)_75%)]',
  gold:
    'bg-[linear-gradient(160deg,rgba(224,184,114,0.4)_0%,rgba(5,7,26,0.88)_75%)]',
  deep:
    'bg-[linear-gradient(160deg,rgba(15,20,56,0.55)_0%,rgba(5,7,26,0.9)_75%)]',
  cool:
    'bg-[linear-gradient(160deg,rgba(56,89,200,0.4)_0%,rgba(5,7,26,0.88)_75%)]',
};

export function ServicesShowcase() {
  return (
    <section
      id="services"
      className="section-base section-violet relative overflow-hidden py-28 md:py-36"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[80%] -translate-x-1/2 bg-gradient-to-b from-violet-glow/20 to-transparent blur-3xl" />

      <div className="container-page">
        <AnimatedSection className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="section-eyebrow">What We Make</span>
            <h2 className="section-heading mt-4">
              Don&rsquo;t read about it.{' '}
              <span className="text-accent-italic text-gradient-gold">
                Watch it move.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-white/65 md:text-right">
            Six visual disciplines under one roof — drone, 3D, walkthroughs,
            virtual tours, marketing and microsites.
          </p>
        </AnimatedSection>

        {/* Scroll-snap on mobile, bento grid on desktop */}
        <div
          className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 hide-scrollbar
                     md:mx-0 md:grid md:grid-cols-6 md:gap-5 md:overflow-visible md:px-0 md:pb-0"
        >
          {SERVICES.map((s, i) => (
            <ServiceTile key={s.id} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const TILE_SPANS = [
  'md:col-span-4', // wide hero tile
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-4', // wide finale
];

const TILE_HEIGHTS = [
  'md:h-[420px]',
  'md:h-[420px]',
  'md:h-[360px]',
  'md:h-[360px]',
  'md:h-[360px]',
  'md:h-[360px]',
];

function ServiceTile({
  service,
  index,
}: {
  service: ServiceShowcaseItem;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative h-[340px] w-[78vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-ink-800
                  sm:w-[60vw]
                  md:w-auto md:shrink ${TILE_SPANS[index] ?? 'md:col-span-2'} ${TILE_HEIGHTS[index] ?? 'md:h-[360px]'}`}
    >
      <Link
        href={service.href}
        className="absolute inset-0 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow"
        aria-label={`See ${service.title} work`}
      >
        <span className="sr-only">See {service.title}</span>
      </Link>

      {/* Looping video bg */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
      >
        <source src={service.videoSrc} type="video/mp4" />
      </video>

      {/* Tint overlay (per service for visual variety) */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${TINT_OVERLAY[service.posterTint]} group-hover:opacity-80`}
      />

      {/* Top eyebrow */}
      <div className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
        {service.eyebrow}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
        <h3 className="text-display text-2xl font-semibold leading-tight text-white md:text-3xl lg:text-4xl">
          {service.title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
          {service.pitch}
        </p>
        <div className="mt-5 inline-flex translate-y-1 items-center gap-1.5 text-sm font-medium text-gold opacity-80 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          See Work
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Hover border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-violet-glow/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-violet-glow/40" />
    </motion.div>
  );
}
