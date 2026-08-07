import React from 'react';

/**
 * StatsBarSkeleton
 * matches StatsBarClient's height and structure to prevent CLS
 */
export function StatsBarSkeleton() {
  return (
    <div className="section-base relative overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,#0A0820_0%,#0E0A2C_50%,#0A0820_100%)] py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-25" />
      <div className="container-page relative">
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:gap-x-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center text-center">
              {/* Skeleton rating/number */}
              <div className="h-10 w-20 animate-pulse rounded bg-white/[0.04] sm:w-28 md:h-16 md:w-36" />
              {/* Skeleton label */}
              <div className="mt-3 h-2.5 w-16 animate-pulse rounded bg-white/[0.04] sm:w-24 md:h-3.5 md:w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * SelectedWorkSkeleton
 * matches SelectedWorkClient's height and layout to prevent CLS
 */
export function SelectedWorkSkeleton() {
  return (
    <section className="section-base section-neutral relative overflow-hidden py-16 md:py-36">
      <div className="container-page">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Selected Work</span>
            <h2 className="section-heading mt-4">
              A glimpse of{' '}
              <span className="text-accent-italic text-gradient">
                work in the wild.
              </span>
            </h2>
          </div>
        </div>

        {/* Sub-header and chevrons */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-48 animate-pulse rounded bg-white/[0.04]" />
          <div className="hidden gap-2 md:flex">
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        </div>

        {/* Carousel/cards scroll strip */}
        <div className="-mx-6 flex gap-5 overflow-x-hidden px-6 pb-5 md:mx-0 md:px-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] w-[72vw] shrink-0 snap-center rounded-3xl border border-white/10 bg-ink-800 animate-pulse sm:w-[44vw] md:w-[22rem] lg:w-[24rem]"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/[0.02]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
