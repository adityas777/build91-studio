'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import {
  WALK_IN_ATTRIBUTION,
  WALK_IN_SAMPLE_SIZE,
  type AssetAttribution,
} from '@/lib/outcomes';

/* ───────────────────────────────────────────────────────────────────────
   AttributionBar — "What gets buyers to walk in"
   ───────────────────────────────────────────────────────────────────────
   Stacked horizontal bar with 7 colored segments, color-coded legend
   beneath. Replaces the earlier GeographyPie donut whose data (India /
   UAE / Australia / Singapore) duplicated the GlobalPresence globe
   above. This tile pivots the slot from "where buyers are from"
   (already shown) to "what assets actually convert" (new insight).

   ── Animation choreography ──────────────────────────────────────────
   1. Tile fades in on viewport entry (once)
   2. Bar segments draw in left-to-right SEQUENTIALLY — each segment
      grows from width 0 to its target value, with 180ms stagger so the
      eye follows the build like a progress meter, not a race
   3. Legend rows fade in staggered (slight lag behind their segment)
   4. Each row's percentage counts up 0 → value over ~600ms
   Total runtime ≈ 1.8s — same budget as the donut it replaced.

   ── Reduced motion ──────────────────────────────────────────────────
   Bar paints fully drawn on mount, legend visible, percentages render
   at final values. No draw-in, no stagger, no count-up.

   ── Hover (desktop only) ────────────────────────────────────────────
   Hovering a legend row OR a bar segment highlights that segment
   (full opacity) and dims the others (~40% opacity). Tap on touch
   doesn't trigger this — natural degradation, no special handling.

   ── Cumulative-offset bar layout ────────────────────────────────────
   Each segment is absolute-positioned at its cumulative `left`% and
   animates `width` from 0 → its `value`%. This means each segment can
   independently animate without affecting the others' positions, and
   the sequential reveal happens visually because of the stagger delays.
   ─────────────────────────────────────────────────────────────────────── */

const BAR_SEGMENT_DURATION_MS = 250;
const BAR_SEGMENT_STAGGER_MS = 180;
const ROW_COUNT_DURATION_MS = 600;

// Dev assertion — segments must sum to 100. Catches data-edit slip-ups
// before they ship with a visually mis-sized bar.
if (
  process.env.NODE_ENV !== 'production' &&
  Math.abs(
    WALK_IN_ATTRIBUTION.reduce((s, x) => s + x.value, 0) - 100,
  ) > 0.001
) {
  console.warn(
    '[AttributionBar] WALK_IN_ATTRIBUTION values must sum to 100. Got',
    WALK_IN_ATTRIBUTION.reduce((s, x) => s + x.value, 0),
  );
}

type SegmentWithStart = AssetAttribution & { start: number; index: number };

export function AttributionBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pre-compute cumulative left offsets so each segment's position is
  // fixed even while its width animates from 0.
  const segments = useMemo<SegmentWithStart[]>(() => {
    let acc = 0;
    return WALK_IN_ATTRIBUTION.map((s, i) => {
      const out = { ...s, start: acc, index: i };
      acc += s.value;
      return out;
    });
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[18rem] flex-col rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(91,33,182,0.10)_0%,rgba(10,8,32,0.6)_100%)] p-5 md:h-full md:min-h-0 md:p-6 md:[grid-area:pie]"
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-violet-soft">
          Asset attribution
        </div>
        <h3 className="text-display mt-2 text-lg font-semibold text-white md:text-xl">
          What gets buyers to walk in
        </h3>
      </div>

      {/* ── Stacked horizontal bar ────────────────────────────────── */}
      <div
        className="relative mt-5 h-3.5 w-full overflow-hidden rounded-full bg-white/[0.06] md:h-4"
        aria-hidden
      >
        {segments.map((seg) => {
          const isHovered = hovered === seg.label;
          const isDimmed = hovered !== null && !isHovered;
          return (
            <div
              key={seg.label}
              className="absolute top-0 h-full transition-opacity duration-200"
              style={{
                left: `${seg.start}%`,
                width: reducedMotion ? `${seg.value}%` : undefined,
                backgroundColor: seg.color,
                opacity: isDimmed ? 0.35 : 1,
                // Animate width via inline transition when motion is allowed
                ...(reducedMotion
                  ? {}
                  : {
                      width: inView ? `${seg.value}%` : '0%',
                      transitionProperty: 'width, opacity',
                      transitionDuration: `${BAR_SEGMENT_DURATION_MS}ms, 200ms`,
                      transitionTimingFunction:
                        'cubic-bezier(0.22, 1, 0.36, 1), linear',
                      transitionDelay: `${seg.index * BAR_SEGMENT_STAGGER_MS}ms, 0ms`,
                    }),
              }}
              onMouseEnter={() => setHovered(seg.label)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <ul
        className="mt-5 flex-1 space-y-2 md:mt-6"
        aria-label="Asset attribution breakdown"
      >
        {segments.map((seg) => (
          <LegendRow
            key={seg.label}
            seg={seg}
            inView={inView}
            reducedMotion={reducedMotion}
            isHovered={hovered === seg.label}
            isDimmed={hovered !== null && hovered !== seg.label}
            onHover={(label) => setHovered(label)}
          />
        ))}
      </ul>

      {/* ── Sample-size strap ──────────────────────────────────────── */}
      <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Across {WALK_IN_SAMPLE_SIZE} we&rsquo;ve measured
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function LegendRow({
  seg,
  inView,
  reducedMotion,
  isHovered,
  isDimmed,
  onHover,
}: {
  seg: SegmentWithStart;
  inView: boolean;
  reducedMotion: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (label: string | null) => void;
}) {
  const [value, setValue] = useState(0);

  // Each row independently times its own count-up so we don't need a
  // global progress driver. Delay matches the row's bar-segment delay
  // plus a small offset (~120ms) so the number starts climbing just as
  // the bar finishes drawing.
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(seg.value);
      return;
    }
    const startAt = seg.index * BAR_SEGMENT_STAGGER_MS + 120;
    const timer = setTimeout(() => {
      let raf = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ROW_COUNT_DURATION_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * seg.value));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, startAt);
    return () => clearTimeout(timer);
  }, [inView, reducedMotion, seg.value, seg.index]);

  // Fade-in styling — same stagger as the bar so the row appears in sync
  const fadeDelay = seg.index * BAR_SEGMENT_STAGGER_MS;

  return (
    <li
      onMouseEnter={() => onHover(seg.label)}
      onMouseLeave={() => onHover(null)}
      className="flex items-center gap-2.5 text-sm transition-opacity duration-200"
      style={{
        opacity: !inView && !reducedMotion ? 0 : isDimmed ? 0.45 : 1,
        transform:
          inView || reducedMotion ? 'translateX(0)' : 'translateX(-6px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: '400ms, 400ms',
        transitionTimingFunction:
          'cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: reducedMotion
          ? '0ms'
          : `${fadeDelay}ms, ${fadeDelay}ms`,
      }}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200"
        style={{
          backgroundColor: seg.color,
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
        }}
        aria-hidden
      />
      <span className="flex-1 truncate text-white/80">{seg.label}</span>
      <span className="shrink-0 tabular-nums text-white/55">{value}%</span>
    </li>
  );
}
