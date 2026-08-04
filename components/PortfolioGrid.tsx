'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CategoryFilter } from './CategoryFilter';
import { PortfolioCard } from './PortfolioCard';
import { MediaModal } from './MediaModal';
import {
  PORTFOLIO_ITEMS,
  type PortfolioCategory,
  type PortfolioItem,
} from '@/lib/portfolioData';

export function PortfolioGrid() {
  const [filter, setFilter] = useState<PortfolioCategory | 'all'>('all');
  const [active, setActive] = useState<PortfolioItem | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PORTFOLIO_ITEMS.length };
    PORTFOLIO_ITEMS.forEach((i) => {
      c[i.category] = (c[i.category] ?? 0) + 1;
    });
    return c;
  }, []);

  const items = useMemo(() => {
    if (filter === 'all') return PORTFOLIO_ITEMS;
    return PORTFOLIO_ITEMS.filter((i) => i.category === filter);
  }, [filter]);

  return (
    <>
      <CategoryFilter active={filter} onChange={setFilter} counts={counts} />

      <div className="container-page py-12">
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              // Promote featured items + every 7th to large on >=sm
              const large = !!item.featured || i % 7 === 0;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={large ? 'sm:col-span-2' : ''}
                >
                  <PortfolioCard
                    item={item}
                    onOpen={setActive}
                    large={large}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <div className="py-32 text-center text-white/50">
            No items in this category yet — check back soon.
          </div>
        )}
      </div>

      <MediaModal item={active} onClose={() => setActive(null)} />
    </>
  );
}
