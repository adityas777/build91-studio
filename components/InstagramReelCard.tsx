'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Reel } from '@/lib/instagram';

const BACKUP_VIDEOS = [
  '/video/projects/Drone 360 with landmarks highlight01.mp4',
  '/video/projects/exterior renders.mp4',
  '/video/projects/interior renders.mp4',
  '/video/projects/3d walkthrough 02.mp4',
  '/video/projects/Superimposition01.mp4',
  '/video/projects/view from under construction balcony02.mp4'
];

/* ───────────────────────────────────────────────────────────────────────
   InstagramReelCard — 9:16 reel card backed by an IG `media_url`
   ───────────────────────────────────────────────────────────────────────
   Visual twin of <SelfHostedReelCard /> (the BentoPortfolio card), but
   wired for Instagram-sourced reels and the lightbox open flow.

   Behaviour:
     • As the card scrolls into view, autoplay starts (muted, looped) —
       TikTok / IG feed feel inside the horizontal scroll strip.
     • As it scrolls out, the video pauses to free decoder resources.
     • Click anywhere on the card opens the fullscreen lightbox (with
       sound, native controls, prev/next nav). NO in-card sound toggle —
       sound flows through the lightbox to avoid two competing click
       affordances on the same target.
     • Poster paints instantly so the card is never blank during load.

   Perf rule: only cards with IntersectionObserver-active state mount the
   `<video>`. Out-of-view cards render the poster only — at any moment
   max ~3 video decoders are alive in a typical scroll strip.

   ── Media URL expiry note ───────────────────────────────────────────
   Meta's `media_url` is a signed CDN link with ~6h life. If a visitor
   keeps the page open >6h AND scrolls back to this card AND the 4h ISR
   hasn't refreshed yet, the <video> can fail silently (CORS / 410).
   The poster still paints, the lightbox click-through still opens IG.
   Acceptable for now; upgrade path is the `/api/reel/[id]` proxy route
   noted in the roadmap.
   ─────────────────────────────────────────────────────────────────────── */

type Props = {
  reel: Reel;
  /** Called when the user clicks the card — opens the lightbox at this reel. */
  onOpen: () => void;
  /** Caption preview shown along the bottom (first line, truncated). */
  index: number;
};

export function InstagramReelCard({ reel, onOpen, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [videoSrc, setVideoSrc] = useState(reel.mediaUrl);

  // Sync state with changing API reel source URLs
  useEffect(() => {
    setVideoSrc(reel.mediaUrl);
  }, [reel.mediaUrl]);

  const handleVideoError = () => {
    const backup = BACKUP_VIDEOS[index % BACKUP_VIDEOS.length];
    if (videoSrc !== backup) {
      console.warn(`Instagram video failed to load. Falling back to local copy: ${backup}`);
      setVideoSrc(backup);
    }
  };

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

  // Sync play state with visibility. Some browsers reject autoplay if
  // the tab is hidden — we catch and ignore the rejection.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView]);

  // First line of caption only, ≤80 chars, for the bottom overlay.
  const captionShort = reel.caption
    .split('\n')[0]
    .replace(/\s+/g, ' ')
    .slice(0, 80)
    .trim();

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
        src={reel.thumbnailUrl}
        alt=""
        loading={index < 3 ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video — mounted only when the card is in (or near) view.
          Live IG media URLs are CORS-allowed for <video src>; if the
          URL has expired the element fails silently and the poster
          remains visible. */}
      {inView && (
        <video
          ref={videoRef}
          key={reel.id}
          src={videoSrc}
          poster={reel.thumbnailUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Full-card click target — opens lightbox */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={
          captionShort ? `Play reel: ${captionShort}` : `Play reel ${index + 1}`
        }
        className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-glow"
      />



      {/* Top-right play icon — fades in on hover. Tells the visitor
          there's more to this card than the silent auto-play preview. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink-900/55 text-white/85 backdrop-blur-md transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-60'
        }`}
      >
        <Play className="h-4 w-4 translate-x-[1px] fill-current" />
      </div>

      {/* Bottom caption — first-line preview only. Vignette gradient
          keeps text legible over any poster. */}
      {captionShort && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-900 via-ink-900/75 to-transparent p-5">
          <p className="line-clamp-2 text-sm leading-snug text-white/90">
            {captionShort}
            {reel.caption.length > captionShort.length && '…'}
          </p>
        </div>
      )}

      {/* Hover ring — same violet glow as BentoPortfolio */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-3xl ring-0 ring-violet-glow/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-violet-glow/40" />
    </div>
  );
}
