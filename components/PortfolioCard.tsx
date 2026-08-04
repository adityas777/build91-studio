'use client';

import { motion } from 'framer-motion';
import { Play, ArrowUpRight } from 'lucide-react';
import type { PortfolioItem } from '@/lib/portfolioData';
import { CATEGORY_LABELS } from '@/lib/portfolioData';

type Props = {
  item: PortfolioItem;
  onOpen: (item: PortfolioItem) => void;
  large?: boolean;
};

export function PortfolioCard({ item, onOpen, large }: Props) {
  const isVideo = item.mediaType !== 'image';

  return (
    <motion.button
      layout
      onClick={() => onOpen(item)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow ${
        large ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
      }`}
      aria-label={`Open ${item.title}`}
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/30 to-transparent" />
      <div className="absolute inset-0 bg-ink-900/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Category badge */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="rounded-full border border-white/15 bg-ink-900/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
          {CATEGORY_LABELS[item.category]}
        </span>
      </div>

      {/* Play button for videos */}
      {isVideo && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink-900/60 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-glow/80">
            <span className="absolute inset-0 animate-pulse-glow rounded-full bg-violet-glow/30 blur-md" />
            <Play className="relative ml-0.5 h-6 w-6 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <div className="text-[10px] uppercase tracking-[0.25em] text-violet-soft/90">
          {item.subcategory}
        </div>
        <h3 className={`text-display mt-1 font-semibold text-white ${
          large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
        }`}>
          {item.title}
        </h3>
        <div className="mt-3 flex translate-y-2 items-center gap-1.5 text-xs font-medium text-white/0 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-gold group-hover:opacity-100">
          View {isVideo ? 'Reel' : 'Project'}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Hover glow border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-violet-glow/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-violet-glow/40" />
    </motion.button>
  );
}
