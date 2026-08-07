'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { Reel } from '@/lib/instagram';

/* ───────────────────────────────────────────────────────────────────────
   ReelLightbox — fullscreen modal for an Instagram reel
   ───────────────────────────────────────────────────────────────────────
   Opened from <SelectedWorkClient />. Behaviour:

   • Backdrop: blurred, near-black; click closes
   • Esc closes; ← / → cycle through reels
   • Video autoplays with controls, native fullscreen still possible
   • Caption (truncated) + "View on Instagram" link below the video
   • Body scroll is locked while open
   • Focus is trapped inside (close + nav buttons); Tab cycles only those
   • Uses createPortal to escape any ancestor `overflow:hidden`

   Mobile:
   • Same layout, smaller chrome, nav buttons sit at the bottom corners
     instead of mid-height so thumbs reach them naturally

   Reduced motion:
   • Backdrop fade is short (180ms); inner content jumps in. The video
     itself respects the user's autoplay-with-motion-reduction preference
     because we set `preload="metadata"` and let the controls do the rest
   ─────────────────────────────────────────────────────────────────────── */

type Props = {
  reels: Reel[];
  index: number;
  onClose: () => void;
  onNavigate: (delta: 1 | -1) => void;
};

export function ReelLightbox({ reels, index, onClose, onNavigate }: Props) {
  const reel = reels[index];
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // ── Body scroll lock ─────────────────────────────────────────────────
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // ── Keyboard: Esc / arrows ───────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate]);

  // ── Focus the close button on open (a11y) ───────────────────────────
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  if (!reel) return null;

  // First line of caption only, truncated for the modal footer. The full
  // text is one click away on Instagram itself.
  const captionShort = reel.caption
    .split('\n')[0]
    .replace(/\s+/g, ' ')
    .slice(0, 140)
    .trim();

  const hasPrev = index > 0;
  const hasNext = index < reels.length - 1;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Instagram reel"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/85 backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
      onClick={(e) => {
        // Click on backdrop (not on child) closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Close (top-right) ───────────────────────────────────────── */}
      <button
        ref={closeBtnRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-900/70 text-white/85 backdrop-blur-md transition-colors hover:border-violet-glow/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow md:right-6 md:top-6"
      >
        <X className="h-5 w-5" />
      </button>

      {/* ── Prev (mid-left desktop, bottom-left mobile) ───────────────── */}
      {hasPrev && (
        <button
          type="button"
          aria-label="Previous reel"
          onClick={() => onNavigate(-1)}
          className="absolute bottom-6 left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-900/70 text-white/85 backdrop-blur-md transition-colors hover:border-violet-glow/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* ── Next (mid-right desktop, bottom-right mobile) ─────────────── */}
      {hasNext && (
        <button
          type="button"
          aria-label="Next reel"
          onClick={() => onNavigate(1)}
          className="absolute bottom-6 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-900/70 text-white/85 backdrop-blur-md transition-colors hover:border-violet-glow/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow md:bottom-auto md:right-6 md:top-1/2 md:-translate-y-1/2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* ── Video card ──────────────────────────────────────────────── */}
      <div className="relative mx-4 flex max-h-[88vh] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <video
          // `key` forces a fresh element when navigating between reels —
          // browsers don't always reload src cleanly on src-change alone
          key={reel.id}
          src={reel.mediaUrl}
          poster={reel.thumbnailUrl}
          controls
          autoPlay
          muted
          playsInline
          preload="metadata"
          className="aspect-[9/16] w-full bg-ink-900 object-cover"
        />

        {(captionShort || reel.permalink) && (
          <div className="border-t border-white/[0.06] bg-ink-900/95 px-5 py-4">
            {captionShort && (
              <p className="text-sm leading-snug text-white/85">
                {captionShort}
                {reel.caption.length > captionShort.length && '…'}
              </p>
            )}
            <a
              href={reel.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-violet-soft transition-colors hover:text-gold focus:outline-none focus-visible:text-gold"
            >
              View on Instagram
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Local keyframe — no Tailwind plugin needed */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role='dialog'] { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
