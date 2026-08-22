import { AttributionBar } from './widgets/AttributionBar';
import { CountUpMetric } from './widgets/CountUpMetric';
import { CountdownBar } from './widgets/CountdownBar';
import { IndiaLaunchMap } from './widgets/IndiaLaunchMap';
import { LiveTicker } from './widgets/LiveTicker';
import { AnimatedSection } from './AnimatedSection';

/* ───────────────────────────────────────────────────────────────────────
   OutcomeWidgets — atlabs-style animated bento, position #14
   ───────────────────────────────────────────────────────────────────────
   Sits between Testimonials (warm) and QuoteToolPromo (slim, dark).
   Different visual language from StatsBar:
     • StatsBar     = top of page, flat, restrained, count-up-once
     • OutcomeWidgets = bottom of page, asymmetric bento, continuous
                        subtle motion, mixed media (map + bar + count-up
                        + pie + ticker)

   Layout — 3-col × 3-row grid with named areas:

     [ map      map      countdown ]
     [ map      map      metric    ]
     [ pie      pie      ticker    ]

   On mobile, the grid collapses to a single column and the DOM order
   takes over as the visual order — deliberately punchy first, ambient
   last: map → metric → countdown → pie → ticker. Desktop placement is
   pinned by `grid-template-areas`, so reordering the DOM does not affect
   the desktop layout.

   Every widget owns its own animation lifecycle and pauses when off-screen
   via IntersectionObserver. JS cost target: <30 KB excluding framer-motion
   (already on the page). All charts are hand-rolled SVG — no Recharts.

   Mobile fitness note: each widget uses `min-h-[Xrem] md:h-full md:min-h-0`
   so the inner flex-col always has explicit height to distribute. The
   IndiaLaunchMap SVG container uses `aspect-[5/6]` on mobile so the map
   never collapses to 0 height inside a flex-1 child of an auto-height grid
   row (a real bug in the first pass that left mobile looking empty).
   ─────────────────────────────────────────────────────────────────────── */

export function OutcomeWidgets() {
  return (
    <section
      aria-label="Real estate marketing outcomes"
      className="section-base section-cool relative overflow-hidden py-10 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-[0.18]" />
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-72 w-72 rounded-full bg-violet-glow/12 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />

      <div className="container-page relative">
        <AnimatedSection className="mx-auto mb-8 max-w-2xl text-center md:mb-16">
          <span className="section-eyebrow">What your launch looks like</span>
          <h2 className="text-display mt-4 text-3xl font-semibold leading-tight md:text-5xl">
            Real reach,{' '}
            <span className="text-accent-italic text-gradient-gold">
              real outcomes.
            </span>
          </h2>
          <p className="mt-4 text-base text-white/65 md:text-lg">
            The page that drives bookings, the bar that beats the deadline,
            the map that shows where your buyers actually come from.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 md:[grid-template-areas:'map_map_countdown''map_map_metric''pie_pie_ticker'] md:[grid-template-rows:repeat(3,minmax(180px,auto))]">
          {/* DOM order chosen for MOBILE visual rhythm — desktop placement
              is pinned via grid-template-areas above, so this order does
              not affect md+ layout. */}
          <IndiaLaunchMap />
          <CountUpMetric />
          <CountdownBar />
          <AttributionBar />
          <LiveTicker />
        </div>
      </div>
    </section>
  );
}
