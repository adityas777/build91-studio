'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/constants';

/**
 * WhatsAppFloat — persistent contact CTA bottom-right.
 *
 * Styled to match the studio's design system (glass + violet glow on hover)
 * rather than the stock green button. Number is derived from SITE.phone.
 */
export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  // Fade in after a beat so it doesn't compete with the hero load animation.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const number = SITE.phone.replace(/[^\d]/g, ''); // → "917880147772"
  const message = encodeURIComponent(
    `Hi Build91 Studio — I'd like to discuss a project.`,
  );
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group fixed bottom-6 right-6 z-40 inline-flex items-center rounded-full border border-white/15 bg-ink-900/80 p-3 text-sm font-medium text-white shadow-[0_15px_50px_-15px_rgba(124,58,237,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-glow/60 hover:bg-ink-900/90 md:bottom-8 md:right-8"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-inner">
        <span className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-400/40 blur-md" />
        {/* Inline WhatsApp glyph (no extra icon dep) */}
        <svg
          viewBox="0 0 32 32"
          aria-hidden
          className="relative h-4 w-4 fill-current"
        >
          <path d="M19.11 17.31c-.27-.13-1.58-.78-1.83-.87-.25-.09-.42-.13-.6.13-.18.27-.69.87-.84 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.33-.79-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.46.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.46h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.22 0 1.31.96 2.58 1.09 2.76.13.18 1.88 2.87 4.55 4.02.64.27 1.13.43 1.52.55.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.81-1.27.22-.62.22-1.16.16-1.27-.06-.11-.24-.18-.51-.31z" />
          <path d="M27.13 4.85A15.85 15.85 0 0 0 16 .25 15.86 15.86 0 0 0 .15 16.13c0 2.8.73 5.54 2.12 7.95L0 32l8.13-2.13a15.84 15.84 0 0 0 7.87 2.01h.01A15.86 15.86 0 0 0 31.85 16c0-4.24-1.66-8.22-4.72-11.15zm-11.13 24.4h-.01a13.16 13.16 0 0 1-6.71-1.84l-.48-.29-4.83 1.27 1.29-4.7-.31-.5a13.18 13.18 0 0 1-2.02-7.06A13.2 13.2 0 0 1 16 2.9c3.52 0 6.83 1.37 9.32 3.86A13.13 13.13 0 0 1 29.2 16.1a13.21 13.21 0 0 1-13.2 13.15z" />
        </svg>
      </span>
    </motion.a>
  );
}
