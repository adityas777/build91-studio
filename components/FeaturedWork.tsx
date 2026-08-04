'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PortfolioCard } from './PortfolioCard';
import { MediaModal } from './MediaModal';
import { FEATURED_ITEMS, type PortfolioItem } from '@/lib/portfolioData';
import { AnimatedSection } from './AnimatedSection';

export function FeaturedWork() {
  const [active, setActive] = useState<PortfolioItem | null>(null);

  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="container-page">
        <AnimatedSection className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-eyebrow">Selected Work</span>
            <h2 className="section-heading mt-4 max-w-2xl">
              A glimpse of <span className="text-accent-italic text-gradient">work in the wild.</span>
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-white/80 transition-colors hover:text-gold md:self-end"
          >
            View All Work
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>

        <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_ITEMS.slice(0, 6).map((item, i) => (
            <PortfolioCard
              key={item.id}
              item={item}
              onOpen={setActive}
              large={i === 0}
            />
          ))}
        </div>
      </div>

      <MediaModal item={active} onClose={() => setActive(null)} />
    </section>
  );
}
