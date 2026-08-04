'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function HomeReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    if (!videoRef.current) return;
    void videoRef.current.play();
    setStarted(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 md:flex-row md:items-stretch md:gap-14"
    >
      {/* Left flank — visible on desktop only, gives the portrait video balance */}
      <div className="hidden flex-1 flex-col items-end justify-center text-right md:flex">
        <span className="section-eyebrow">Studio Reel</span>
        <h3 className="text-display mt-3 text-3xl font-semibold leading-tight md:text-4xl">
          Thirty-three seconds of <br />
          <span className="text-accent-italic text-gradient">what we build.</span>
        </h3>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
          A cut of Interactive Plotted Development, Location Intelligence and Cinematic 3D visualisation shipped for
          developers across India, UAE and Australia.
        </p>
      </div>

      {/* Phone-frame portrait player */}
      <div className="relative shrink-0">
        {/* Outer glow */}
        <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-violet-glow/30 via-transparent to-gold/20 blur-3xl" />

        <div
          className="relative aspect-[9/16] w-[min(78vw,320px)] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-900 shadow-[0_40px_120px_-30px_rgba(124,58,237,0.6)] md:w-[340px]"
        >
          {/* Inset ring accent */}
          <div className="pointer-events-none absolute inset-0 z-10 rounded-[2rem] ring-1 ring-inset ring-white/10" />

          <video
            ref={videoRef}
            src="/video/intro-reel-web.mp4"
            poster="/video/intro-poster.jpg"
            preload="metadata"
            playsInline
            controls={started}
            onEnded={() => setStarted(false)}
            className="absolute inset-0 h-full w-full bg-ink-900 object-cover"
          />

          {!started && (
            <button
              type="button"
              onClick={play}
              aria-label="Play Build91 Studio introduction reel"
              className="group absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-t from-ink-900/75 via-ink-900/20 to-ink-900/45 transition-colors hover:from-ink-900/60"
            >
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink-900/70 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
                <span className="absolute inset-0 animate-pulse-glow rounded-full bg-violet-glow/30 blur-xl" />
                <span className="absolute inset-0 rounded-full ring-1 ring-white/20" />
                <Play className="relative ml-0.5 h-6 w-6 fill-white text-white md:h-7 md:w-7" />
              </span>
              <span className="mt-5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/75">
                Studio Reel
              </span>
              <span className="mt-1.5 text-[11px] text-white/45">
                33s · sound on
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Right flank — visible on desktop only, mirrors the left for balance */}
      <div className="hidden flex-1 flex-col items-start justify-center md:flex">
        <ul className="space-y-4">
          {[
            { k: '01', v: 'Interactive Plotted Development' },
            { k: '02', v: 'Location Intelligence' },
            { k: '03', v: '3D Superimposition' },
            { k: '04', v: 'Cinematic 3D' },
            { k: '05', v: 'Project microsites & launch films' },
          ].map((row) => (
            <li key={row.k} className="flex items-start gap-4">
              <span className="text-display text-xs tracking-[0.3em] text-violet-soft pt-1">
                {row.k}
              </span>
              <span className="text-sm leading-relaxed text-white/70">
                {row.v}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
