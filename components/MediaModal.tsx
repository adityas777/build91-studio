'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { PortfolioItem } from '@/lib/portfolioData';

type Props = {
  item: PortfolioItem | null;
  onClose: () => void;
};

export function MediaModal({ item, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/85 px-4 py-10 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink-900 text-white shadow-xl transition-colors hover:bg-violet-glow"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <div className="relative aspect-video w-full bg-ink-900">
                {item.mediaType === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaSrc}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {item.mediaType === 'youtube' && (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${item.mediaSrc}?autoplay=1&rel=0`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {item.mediaType === 'vimeo' && (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://player.vimeo.com/video/${item.mediaSrc}?autoplay=1`}
                    title={item.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {item.mediaType === 'video' && (
                  <video
                    src={item.mediaSrc}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 h-full w-full"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-white/10 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-violet-soft">
                    <span>{item.subcategory}</span>
                    {item.client && (
                      <>
                        <span className="text-white/30">·</span>
                        <span className="text-white/60">{item.client}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-display mt-2 text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>

              {item.description && (
                <p className="border-t border-white/10 p-6 pt-5 text-sm leading-relaxed text-white/70">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
