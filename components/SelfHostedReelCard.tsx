'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { PortfolioItem } from '@/lib/portfolioData';

/**
 * SelfHostedReelCard — clean 9:16 reel card backed by a local MP4.
 *
 * Behaviour (TikTok / IG feed style):
 *   • As the card scrolls into view, autoplay starts (muted, loop).
 *   • As it scrolls out, the video pauses to free decoder resources.
 *   • Click anywhere on the card to toggle sound — muted ⇄ unmuted.
 *     A small speaker icon in the corner reflects state.
 *   • Poster image paints instantly so the card isn't blank during load.
 *
 * Perf rule, same as before: only cards with IntersectionObserver-active
 * state mount the <video> element. Out-of-view cards render the poster
 * only — at any moment max ~3 video decoders are alive.
 *
 * ASSET SWAP: drop each clip into /public/video/work/{slug}.mp4. See
 * lib/portfolioData.ts for the expected paths. Recommended encode:
 *   ffmpeg -i src.mp4 -an -vf "scale=720:-2,fps=30" \
 *     -c:v libx264 -crf 24 -preset slow -movflags +faststart \
 *     -pix_fmt yuv420p out.mp4
 * Add -an only if the reel has no useful audio; otherwise drop it so
 * sound is available when the user unmutes.
 */
export function SelfHostedReelCard({ item }: { item: PortfolioItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  // Reveal the speaker chip only after the user starts interacting so it
  // doesn't fight the visual at first glance.
  const [hovered, setHovered] = useState(false);

  // ── Visibility tracking — start/pause playback as cards scroll ─────
  useEffect(() => {
    if (!cardRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(cardRef.current);
    return () => io.disconnect();
  }, []);

  // Sync play state with visibility. Browsers may reject autoplay if the
  // tab is hidden — we catch and ignore the rejection.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView]);

  function toggleSound(e: React.MouseEvent) {
    e.preventDefault();
    setMuted((m) => !m);
    // If we just unmuted, ensure the video is also playing — some
    // browsers require an explicit play() after unmute.
    const v = videoRef.current;
    if (v && muted) v.play().catch(() => {});
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-[9/16] w-[72vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-ink-800 sm:w-[44vw] md:w-[22rem] lg:w-[24rem]"
    >
      {/* Poster — visible until the video paints + as a fallback */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video — mounted only when the card is in (or near) view */}
      {inView && (
        <video
          ref={videoRef}
          key={item.mediaSrc}
          poster={item.thumbnail}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={item.mediaSrc} type="video/mp4" />
        </video>
      )}

      {/* Click target for sound toggle — full card, but doesn't block the
          subtle bottom caption from being read by screen readers */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? `Unmute ${item.title}` : `Mute ${item.title}`}
        className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow"
      />

      {/* Subcategory pill (top-left) */}
      <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-ink-900/55 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white/85 backdrop-blur-md">
        {item.subcategory}
      </span>

      {/* Sound state chip (top-right) — fades in on hover OR when unmuted */}
      <div
        aria-hidden
        className={`pointer-events-none absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-ink-900/55 text-white/85 backdrop-blur-md transition-opacity duration-300 ${
          hovered || !muted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </div>

      {/* Bottom caption — title + client */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-900 via-ink-900/75 to-transparent p-5">
        <h3 className="text-display text-base font-semibold leading-tight text-white md:text-lg">
          {item.title}
        </h3>
        {item.client && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
            {item.client}
          </p>
        )}
      </div>

      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-3xl ring-0 ring-violet-glow/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-violet-glow/40" />
    </div>
  );
}
