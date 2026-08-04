'use client';

import { useEffect, useState } from 'react';

/**
 * Reactive matchMedia hook — returns true when the given query matches.
 *
 * Starts `false` on first render so SSR and the first client render agree
 * (no hydration mismatch). The effect then runs and flips to the real
 * value, plus subscribes for resize / orientation changes.
 *
 * Used for picking between desktop and mobile media assets at runtime —
 * browsers stopped honouring the `media` attribute on <source> inside
 * <video> elements, so we have to swap sources from JS.
 */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return match;
}

/** Convenience: true on viewports ≥ 768px (Tailwind's `md` breakpoint). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
