'use client';

import { motion } from 'framer-motion';
import { CATEGORY_LABELS, CATEGORY_ORDER, type PortfolioCategory } from '@/lib/portfolioData';

type Props = {
  active: PortfolioCategory | 'all';
  onChange: (cat: PortfolioCategory | 'all') => void;
  counts: Record<string, number>;
};

export function CategoryFilter({ active, onChange, counts }: Props) {
  return (
    <div className="sticky top-20 z-30 -mx-6 border-b border-white/10 bg-ink-900/80 px-6 py-4 backdrop-blur-xl md:-mx-10 md:px-10 lg:-mx-16 lg:px-16">
      <div className="container-page p-0">
        <div className="hide-scrollbar -mx-2 flex gap-1 overflow-x-auto px-2 scroll-snap-x">
          {CATEGORY_ORDER.map((cat) => {
            const isActive = active === cat;
            const count = counts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange(cat)}
                className={`scroll-snap-item relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-deep to-violet-glow shadow-[0_8px_24px_-8px_rgba(124,58,237,0.7)]"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <span>{CATEGORY_LABELS[cat]}</span>
                <span
                  className={`ml-2 text-[10px] ${
                    isActive ? 'text-white/80' : 'text-white/35'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
