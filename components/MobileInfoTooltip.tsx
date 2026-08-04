'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ───────────────────────────────────────────────────────────────────────
   MobileInfoTooltip
   ───────────────────────────────────────────────────────────────────────
   A small floating tooltip (NOT an inline accordion) anchored to a ⓘ
   icon. Used everywhere we need to surface a sub-line on mobile without
   disturbing the surrounding card / form alignment.

   Visibility:
     • Component is `md:hidden` — desktop always shows sub-text inline.
     • On mobile: ⓘ visible, popover renders absolutely on tap.

   Behaviour:
     • Tap ⓘ → popover fades in above the icon.
     • Tap outside, press Escape, or tap ⓘ again → popover dismisses.
     • Always pointer-stops propagation so the wrapping card's onClick
       (e.g. card-select, asset-toggle) never fires by accident.

   Layout:
     • Popover is `absolute bottom-full right-0` — it floats above the
       icon, right-aligned so it stays within the card boundary on
       narrow screens.
     • Max-width = viewport - 2rem, so it never clips on small phones.
     • A small arrow points down to the icon.
   ─────────────────────────────────────────────────────────────────────── */

type Props = {
  text: string;
  /** Accessible label for the trigger button. */
  label?: string;
};

export function MobileInfoTooltip({ text, label = 'Show details' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // mousedown for cursors, touchstart for touch — covers both.
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-block md:hidden">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-label={open ? 'Hide details' : label}
        aria-expanded={open}
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          open
            ? 'border-violet-glow/40 bg-violet-glow/[0.12] text-violet-soft'
            : 'border-white/15 bg-white/[0.04] text-white/55'
        }`}
      >
        <Info className="h-3 w-3" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            // bottom-full + mb-2 lifts it 8px above the icon.
            // right-0 keeps it inside the card on narrow phones.
            // max-w-[calc(100vw-2rem)] prevents viewport clipping.
            className="absolute bottom-full right-0 z-50 mb-2 block w-64 max-w-[calc(100vw-2rem)] origin-bottom-right rounded-xl border border-white/15 bg-ink-900/95 p-3 text-left text-xs leading-relaxed text-white/85 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {text}
            {/* Down-arrow: 12px from right edge so it sits below the
                icon's centre (icon is 24px wide, anchored at right-0). */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-2 inline-block h-3 w-3 rotate-45 border-b border-r border-white/15 bg-ink-900/95"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
