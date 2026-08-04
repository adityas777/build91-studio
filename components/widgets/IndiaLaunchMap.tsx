'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { LAUNCH_CITIES } from '@/lib/outcomes';

/* ───────────────────────────────────────────────────────────────────────
   IndiaLaunchMap — constellation of launch cities, one pulses at a time
   ───────────────────────────────────────────────────────────────────────
   Stylised network of city dots arranged roughly in the shape of India.
   NOT a literal geographic map (no political outline) — picks the
   "presence" feel without the licensing or weight of a real GeoJSON.

   Rotates a "pulse" through the city list every ~2.5s, weight-prioritised.
   When tile is off-screen, the rotation pauses (perf) and the pulse animation
   freezes. Honors prefers-reduced-motion by jumping straight to a static
   constellation with no rotation.
   ─────────────────────────────────────────────────────────────────────── */

const ROTATE_MS = 2500;

export function IndiaLaunchMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Rotate active pulse — paused when off-screen or reduced-motion.
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % LAUNCH_CITIES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [inView, reducedMotion]);

  // Pre-compute lines from each city to the most-central one (Hyderabad-ish)
  // so the constellation has visible connective tissue.
  const lines = useMemo(() => {
    // Pick the centroid by averaging — keeps the visual balanced regardless
    // of how the city list is edited.
    const cx =
      LAUNCH_CITIES.reduce((s, c) => s + c.x, 0) / LAUNCH_CITIES.length;
    const cy =
      LAUNCH_CITIES.reduce((s, c) => s + c.y, 0) / LAUNCH_CITIES.length;
    return LAUNCH_CITIES.map((c) => ({ x1: c.x, y1: c.y, x2: cx, y2: cy }));
  }, []);

  const activeCity = LAUNCH_CITIES[activeIdx];

  return (
    <div
      ref={ref}
      className="relative flex w-full flex-col rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(124,58,237,0.06)_0%,rgba(10,8,32,0.6)_100%)] p-5 md:h-full md:p-6 md:[grid-area:map]"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
            Across India
          </div>
          <h3 className="text-display mt-2 text-xl font-semibold text-white md:text-2xl">
            Launches lit up — last 12 months
          </h3>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/60 md:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden />
          Live
        </span>
      </div>

      {/* Map area — fixed 5:6 aspect on mobile (where parent has no
          determined height) so the SVG never collapses to 0. On md+ the
          parent supplies an explicit min row height, so we hand back to
          flex-1 to fill the bento tile properly. */}
      <div className="relative mt-4 aspect-[5/6] w-full md:aspect-auto md:flex-1">
        <svg
          viewBox="0 0 100 120"
          aria-hidden
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background dot field — gives a soft "constellation" backdrop. */}
          <defs>
            <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E0B872" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E0B872" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connective lines — to centroid, faint */}
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="rgba(167,139,250,0.18)"
              strokeWidth="0.25"
            />
          ))}

          {/* City dots */}
          {LAUNCH_CITIES.map((c, i) => {
            const isActive = i === activeIdx;
            return (
              <g key={c.name}>
                {isActive && (
                  <>
                    {/* Halo */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="6"
                      fill="url(#cityGlow)"
                      opacity={reducedMotion ? 0.6 : 1}
                    />
                    {/* Outer pulsing ring */}
                    {!reducedMotion && (
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="2.5"
                        fill="none"
                        stroke="#E0B872"
                        strokeWidth="0.4"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="r"
                          values="2.5;5;5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.7;0;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </>
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isActive ? '1.6' : '1.1'}
                  fill={isActive ? '#F3D690' : 'rgba(255,255,255,0.55)'}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active city caption */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Now showing
          </div>
          <div className="text-display mt-0.5 truncate text-base font-semibold text-gold-soft md:text-lg">
            {activeCity.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-display text-2xl font-semibold text-white md:text-3xl">
            {LAUNCH_CITIES.length}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Cities
          </div>
        </div>
      </div>
    </div>
  );
}
