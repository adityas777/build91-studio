'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsDesktop } from '@/lib/useMediaQuery';

/**
 * ScrollPinReveal — pinned scroll-driven slide reveal (desktop + mobile).
 *
 * Pattern (inspired by thevrcompany.in's full-bleed scroll sections):
 *   • Outer wrapper is N viewports tall (one viewport per slide).
 *   • Inner viewport is `sticky top-0 h-screen` and holds the visuals.
 *   • useScroll returns 0→1 progress through the wrapper; each slide owns
 *     a 1/N slot and cross-fades in around its center.
 *   • Backgrounds cross-fade with a subtle Ken-Burns scale.
 *   • Text panels cross-fade + drift vertically in lockstep.
 *   • Right-edge progress rail (desktop) / top progress bar (mobile).
 *
 * Mobile notes:
 *   • Uses 100svh to avoid the iOS Safari bottom-chrome jump.
 *   • Below md the stage pins BELOW the fixed 80px header (top-20 +
 *     h-[calc(100svh-5rem)]) instead of under it. The nav goes opaque past
 *     24px of scroll — which is always true inside this section — so a
 *     full-bleed pin would bury the top of the frame behind it. Desktop
 *     keeps the full-bleed pin (top-0 / 100svh).
 *   • Text panel sits in the lower half with a heavier gradient floor.
 *   • Header stays compact and fades out as you enter slide 1.
 *   • Video is TOP-ANCHORED below md (`origin-top` + `object-top`): the
 *     Ken-Burns zoom grows downward instead of outward from the centre,
 *     and any cover-crop eats from the bottom. So the top half of the
 *     frame is never clipped — and the crop lands in the lower third,
 *     which the text panel + gradient floor already occlude. Desktop
 *     keeps centre origin, where the wide viewport crops height instead.
 *     Done in CSS (not the isDesktop prop) so it's right on first paint;
 *     the md breakpoint matches useIsDesktop's 768px source swap.
 *
 * Perf:
 *   • Only mounts <video> for slides within ±1 of the active index, so the
 *     browser never juggles N decoders at once.
 *
 * ASSET SWAP: each slide's `mediaSrc` defaults to the studio reel. Replace
 * with a unique 8-15s loop per slide (muted, h.264, scale 960px) for full
 * effect.
 */

export type ScrollPinSlide = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  /**
   * Desktop / landscape source (16:9). Required.
   */
  mediaSrc: string;
  /**
   * Optional portrait re-cut (9:16) for mobile. If omitted, the desktop
   * source is used everywhere (acceptable when the composition is
   * center-framed and crops cleanly to portrait).
   */
  mediaSrcMobile?: string;
  posterTint?: 'violet' | 'gold' | 'deep' | 'cool' | 'warm';
};

type Props = {
  id?: string;
  sectionEyebrow: string;
  sectionHeading: ReactNode;
  sectionDeck?: string;
  slides: ScrollPinSlide[];
};

// Tints used to be near-opaque on the lower-right — they blacked out most
// of the footage. These are now thin colour washes: just enough hue to
// distinguish slides and to sit a slight mood over the video, but well
// shy of obscuring it. Readability of the text panel is handled by the
// targeted bottom gradient below, not by the tint.
const TINT_BG: Record<NonNullable<ScrollPinSlide['posterTint']>, string> = {
  violet:
    'bg-[linear-gradient(135deg,rgba(23,109,159,0.28)_0%,rgba(1,4,11,0.45)_100%)]',
  gold:
    'bg-[linear-gradient(135deg,rgba(23,109,159,0.22)_0%,rgba(1,4,11,0.50)_100%)]',
  deep:
    'bg-[linear-gradient(135deg,rgba(23,33,45,0.32)_0%,rgba(1,4,11,0.45)_100%)]',
  cool:
    'bg-[linear-gradient(135deg,rgba(23,109,159,0.22)_0%,rgba(1,4,11,0.45)_100%)]',
  warm:
    'bg-[linear-gradient(135deg,rgba(23,109,159,0.16)_0%,rgba(1,4,11,0.50)_100%)]',
};

export function ScrollPinReveal({
  id,
  sectionEyebrow,
  sectionHeading,
  sectionDeck,
  slides,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slidesCount = slides.length;
  const isDesktop = useIsDesktop();

  // Outer height = N viewports of scroll runway, in svh so mobile Safari
  // doesn't jump when the URL bar collapses/expands.
  const outerHeight = `${slidesCount * 100}svh`;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Only mount <video> for slides within ±1 of the active index.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (p) => {
      const next = Math.min(
        slidesCount - 1,
        Math.max(0, Math.floor(p * slidesCount)),
      );
      setActiveIdx((prev) => (prev === next ? prev : next));
    });
    return () => unsub();
  }, [scrollYProgress, slidesCount]);

  return (
    <section
      id={id}
      aria-label={
        typeof sectionHeading === 'string' ? sectionHeading : undefined
      }
      className="section-base relative bg-ink-900"
    >
      {/* ── Intro band (normal flow) ───────────────────────────────────
          Sits ABOVE the sticky scroll runway so the cinematic sequence
          plays clean. User reads the section header once, scrolls past,
          then video owns the viewport. */}
      <div className="container-page relative pt-10 pb-6 sm:pt-12 md:pt-14 md:pb-8">
        <span className="section-eyebrow">{sectionEyebrow}</span>
        <h2 className="text-display mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
          {sectionHeading}
        </h2>
        {sectionDeck && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:max-w-xl sm:text-base">
            {sectionDeck}
          </p>
        )}
      </div>

      <div
        ref={wrapperRef}
        className="relative"
        style={{ height: outerHeight }}
      >
        {/* Below md the stage pins BELOW the 80px fixed header (h-20) rather
            than under it, so the top-anchored frame isn't hidden behind the
            nav's opaque scrolled state. Desktop keeps the full-bleed pin. */}
        <div className="sticky top-20 h-[calc(100svh-5rem)] w-full overflow-hidden md:top-0 md:h-[100svh]">
          {/* Background stack */}
          {slides.map((s, i) => (
            <SlideBackground
              key={s.id}
              slide={s}
              index={i}
              count={slidesCount}
              progress={scrollYProgress}
              videoActive={Math.abs(i - activeIdx) <= 1}
              isDesktop={isDesktop}
            />
          ))}

          {/* Bottom-anchored readability gradient — only shields the lower
              third of the frame where the text panel sits, leaving the rest
              of the video clear. Grid is barely-there texture. */}
          <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-[0.06] md:opacity-[0.08]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent md:h-1/2 md:from-ink-900/70 md:via-ink-900/15" />

          {/* Mobile-only thin top progress bar */}
          <MobileProgressBar
            progress={scrollYProgress}
            count={slidesCount}
            activeIdx={activeIdx}
          />

          {/* Text panels */}
          <div className="container-page absolute inset-x-0 bottom-0 z-10 pb-10 sm:pb-12 lg:pb-16">
            <div className="relative h-[300px] sm:h-[260px] lg:h-[280px]">
              {slides.map((s, i) => (
                <SlideText
                  key={s.id}
                  slide={s}
                  index={i}
                  count={slidesCount}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>

          {/* Desktop right-edge progress rail */}
          <ProgressRail
            slides={slides}
            progress={scrollYProgress}
            count={slidesCount}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Slide background (video + tint) ─────────────────────────────────── */
function SlideBackground({
  slide,
  index,
  count,
  progress,
  videoActive,
  isDesktop,
}: {
  slide: ScrollPinSlide;
  index: number;
  count: number;
  progress: MotionValue<number>;
  videoActive: boolean;
  isDesktop: boolean;
}) {
  // Pick the right encode for this viewport. If no portrait variant was
  // provided, fall back to the desktop file — fine for center-framed shots.
  const src = !isDesktop && slide.mediaSrcMobile ? slide.mediaSrcMobile : slide.mediaSrc;
  const slot = 1 / count;
  const center = slot * (index + 0.5);
  const start = Math.max(0, center - slot * 0.8);
  const end = Math.min(1, center + slot * 0.8);

  const opacity = useTransform(
    progress,
    [start, center - slot * 0.15, center + slot * 0.15, end],
    index === 0
      ? [1, 1, 1, 0]
      : index === count - 1
        ? [0, 1, 1, 1]
        : [0, 1, 1, 0],
  );
  const scale = useTransform(progress, [start, end], [1.02, 1.12]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden>
      <motion.div
        style={{ scale }}
        className="absolute inset-0 h-full w-full origin-top bg-ink-800 md:origin-center"
      >
        {videoActive ? (
          <video
            // Key on src so the browser swaps files cleanly if the viewport
            // class flips (e.g., device rotate crossing the breakpoint).
            key={`${slide.id}-${src}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover object-top md:object-center"
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(50,156,221,0.25),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(206,58,210,0.15),transparent_60%),linear-gradient(135deg,#0d1822,#01040b)]" />
        )}
      </motion.div>
      <div
        className={`pointer-events-none absolute inset-0 ${TINT_BG[slide.posterTint ?? 'violet']}`}
      />
    </motion.div>
  );
}

/* ─── Slide text panel ────────────────────────────────────────────────── */
function SlideText({
  slide,
  index,
  count,
  progress,
}: {
  slide: ScrollPinSlide;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const slot = 1 / count;
  const center = slot * (index + 0.5);
  const start = Math.max(0, center - slot * 0.55);
  const end = Math.min(1, center + slot * 0.55);

  const opacity = useTransform(
    progress,
    [start, center - slot * 0.1, center + slot * 0.1, end],
    index === 0
      ? [1, 1, 1, 0]
      : index === count - 1
        ? [0, 1, 1, 1]
        : [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, center, end], [30, 0, -30]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex max-w-3xl flex-col justify-end"
    >
      <span className="inline-flex items-center gap-3 self-start rounded-full border border-white/15 bg-ink-900/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-white/85 backdrop-blur-md sm:px-4 sm:text-[11px] sm:tracking-[0.3em]">
        <span className="text-violet-soft">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-1 w-1 rounded-full bg-white/40" />
        {slide.eyebrow}
      </span>
      <h3 className="text-display mt-4 text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
        {slide.title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base md:text-lg">
        {slide.body}
      </p>
    </motion.div>
  );
}

/* ─── Right-side progress rail (desktop only) ────────────────────────── */
function ProgressRail({
  slides,
  progress,
  count,
}: {
  slides: ScrollPinSlide[];
  progress: MotionValue<number>;
  count: number;
}) {
  return (
    <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col gap-4">
        {slides.map((s, i) => (
          <RailDot
            key={s.id}
            label={s.eyebrow}
            index={i}
            count={count}
            progress={progress}
          />
        ))}
      </ul>
    </div>
  );
}

function RailDot({
  label,
  index,
  count,
  progress,
}: {
  label: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const slot = 1 / count;
  const center = slot * (index + 0.5);
  const start = center - slot * 0.5;
  const end = center + slot * 0.5;

  const active = useTransform(progress, [start, center, end], [0, 1, 0]);
  const width = useTransform(active, [0, 1], [12, 36]);
  const opacity = useTransform(active, [0, 1], [0.3, 1]);

  return (
    <li className="group flex items-center justify-end gap-3">
      <motion.span
        style={{ opacity }}
        className="text-[10px] font-medium uppercase tracking-[0.25em] text-white"
      >
        {label}
      </motion.span>
      <motion.span
        style={{ width, opacity }}
        className="h-[2px] rounded-full bg-gradient-to-r from-violet-glow to-gold"
      />
    </li>
  );
}

/* ─── Mobile/tablet top progress bar ─────────────────────────────────── */
function MobileProgressBar({
  progress,
  count,
  activeIdx,
}: {
  progress: MotionValue<number>;
  count: number;
  activeIdx: number;
}) {
  // Map overall 0→1 to a continuous bar width.
  const width = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    // pt-4 below md (the stage already starts under the header, so no need to
    // clear it again); pt-20 from md to lg, where the stage is still full-bleed
    // and the bar has to duck the 80px fixed nav itself.
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-6 pt-4 md:pt-20 lg:hidden">
      <span className="text-display text-[11px] font-semibold tabular-nums text-white/80">
        {String(activeIdx + 1).padStart(2, '0')}
      </span>
      <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
        <motion.div
          style={{ width }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-glow to-gold"
        />
      </div>
      <span className="text-[11px] font-medium tabular-nums text-white/50">
        {String(count).padStart(2, '0')}
      </span>
    </div>
  );
}
