'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      setScale(width / 1920);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Header section */}
      <section className="section-base section-warm overflow-hidden pb-12 pt-40 md:pb-16 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-45" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/15 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="section-eyebrow">Portfolio</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Our{' '}
              <span className="text-accent-italic text-gradient">selected</span>{' '}
              creative{' '}
              <span className="text-accent-italic text-gradient-gold">
                works.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              A curated showcase of high-end real estate rendering, photorealistic 3D visualization, and interactive virtual walkthroughs.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 3D Virtual Tour Embed (Moved from Homepage) ──────────────────────────────────── */}
      <AnimatedSection className="w-full my-16 md:my-20">
        <div
          ref={containerRef}
          className="relative w-full border-y border-white/10 bg-black/20 shadow-2xl overflow-hidden"
          style={{ height: `${800 * scale}px` }}
        >
          <iframe
            src="https://demo.build91.in/3BHK-Tour/index.htm"
            className="absolute border-0"
            style={{
              width: '1920px',
              height: '800px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              left: 0,
              top: 0,
            }}
            allowFullScreen
            loading="lazy"
            title="Build91 Studio 3D Virtual Tour"
          />
        </div>
      </AnimatedSection>
    </>
  );
}
