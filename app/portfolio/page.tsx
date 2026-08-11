'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

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

      {/* ── 3D Portfolio Grid Section ──────────────────────────────────── */}
      <section className="section-base overflow-hidden pt-4 pb-32">
        <div className="container-page mb-12">
          <AnimatedSection className="text-center">
            <h2 className="text-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              3D Designs That Turn<br/>
              <span className="text-accent-italic text-gradient">Vision Into Reality</span>
            </h2>
          </AnimatedSection>
        </div>

        <div className="w-full px-1 md:px-2">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 md:gap-1.5 items-start lg:h-[2200px]">
              {/* Column 1 */}
              <div className="flex flex-col gap-1 md:gap-1.5 h-auto lg:h-full">
                {COLUMN_1.map((item) => {
                  if (item.type === 'row') {
                    return (
                      <div key={item.id} className={`grid grid-cols-2 gap-1 md:gap-1.5 w-full overflow-hidden lg:h-0 ${item.flex}`}>
                        {item.images.map((img) => (
                          <div 
                            key={img.id} 
                            className="w-full h-full overflow-hidden rounded-[4px] transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group"
                            onClick={() => setActiveImage(img.src)}
                          >
                            <img
                              src={img.src}
                              alt={`3D Design Rendering ${img.id}`}
                              className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={item.id} 
                      className={`w-full overflow-hidden rounded-[4px] lg:h-0 transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group ${item.flex}`}
                      onClick={() => setActiveImage(item.src)}
                    >
                      <img
                        src={item.src}
                        alt={`3D Design Rendering ${item.id}`}
                        className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-1 md:gap-1.5 h-auto lg:h-full">
                {COLUMN_2.map((item) => {
                  if (item.type === 'row') {
                    return (
                      <div key={item.id} className={`grid grid-cols-2 gap-1 md:gap-1.5 w-full overflow-hidden lg:h-0 ${item.flex}`}>
                        {item.images.map((img) => (
                          <div 
                            key={img.id} 
                            className="w-full h-full overflow-hidden rounded-[4px] transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group"
                            onClick={() => setActiveImage(img.src)}
                          >
                            <img
                              src={img.src}
                              alt={`3D Design Rendering ${img.id}`}
                              className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={item.id} 
                      className={`w-full overflow-hidden rounded-[4px] lg:h-0 transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group ${item.flex}`}
                      onClick={() => setActiveImage(item.src)}
                    >
                      <img
                        src={item.src}
                        alt={`3D Design Rendering ${item.id}`}
                        className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-1 md:gap-1.5 h-auto lg:h-full">
                {COLUMN_3.map((item) => {
                  if (item.type === 'row') {
                    return (
                      <div key={item.id} className={`grid grid-cols-2 gap-1 md:gap-1.5 w-full overflow-hidden lg:h-0 ${item.flex}`}>
                        {item.images.map((img) => (
                          <div 
                            key={img.id} 
                            className="w-full h-full overflow-hidden rounded-[4px] transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group"
                            onClick={() => setActiveImage(img.src)}
                          >
                            <img
                              src={img.src}
                              alt={`3D Design Rendering ${img.id}`}
                              className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={item.id} 
                      className={`w-full overflow-hidden rounded-[4px] lg:h-0 transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] cursor-pointer group ${item.flex}`}
                      onClick={() => setActiveImage(item.src)}
                    >
                      <img
                        src={item.src}
                        alt={`3D Design Rendering ${item.id}`}
                        className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 transition-opacity duration-300 cursor-zoom-out"
          onClick={() => setActiveImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-4xl font-light transition-colors duration-200"
            onClick={() => setActiveImage(null)}
            aria-label="Close lightbox"
          >
            &times;
          </button>
          <div className="relative max-w-5xl max-h-[90vh] cursor-default" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage}
              alt="Enlarged 3D Render"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

type GridItem = 
  | { type: 'full'; id: number; src: string; flex: string }
  | { type: 'row'; id: string; flex: string; images: { id: number; src: string }[] };

const COLUMN_1: GridItem[] = [
  { type: 'full', id: 7, src: '/images/portfolio/extracted_image_7.png', flex: 'lg:flex-[1.8_1_0%]' },
  { 
    type: 'row', 
    id: 'c1-r2', 
    flex: 'lg:flex-[1_1_0%]',
    images: [
      { id: 4, src: '/images/portfolio/extracted_image_4.jpeg' },
      { id: 5, src: '/images/portfolio/extracted_image_5.jpeg' }
    ] 
  },
  { 
    type: 'row', 
    id: 'c1-r3', 
    flex: 'lg:flex-[1_1_0%]',
    images: [
      { id: 8, src: '/images/portfolio/extracted_image_8.jpeg' },
      { id: 9, src: '/images/portfolio/extracted_image_9.png' }
    ] 
  },
  { type: 'full', id: 13, src: '/images/portfolio/extracted_image_13.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
  { type: 'full', id: 16, src: '/images/portfolio/extracted_image_16.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
  { type: 'full', id: 17, src: '/images/portfolio/extracted_image_17.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
];

const COLUMN_2: GridItem[] = [
  { 
    type: 'row', 
    id: 'c2-r1', 
    flex: 'lg:flex-[1_1_0%]',
    images: [
      { id: 1, src: '/images/portfolio/extracted_image_1.jpeg' },
      { id: 2, src: '/images/portfolio/extracted_image_2.jpeg' }
    ] 
  },
  { type: 'full', id: 6, src: '/images/portfolio/extracted_image_6.jpeg', flex: 'lg:flex-[1.8_1_0%]' },
  { type: 'full', id: 12, src: '/images/portfolio/extracted_image_12.png', flex: 'lg:flex-[1.4_1_0%]' },
  { type: 'full', id: 10, src: '/images/portfolio/extracted_image_10.png', flex: 'lg:flex-[1_1_0%]' },
  { type: 'full', id: 18, src: '/images/portfolio/extracted_image_18.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
  { type: 'full', id: 19, src: '/images/portfolio/extracted_image_19.jpeg', flex: 'lg:flex-[1_1_0%]' },
];

const COLUMN_3: GridItem[] = [
  { type: 'full', id: 11, src: '/images/portfolio/extracted_image_11.png', flex: 'lg:flex-[1.8_1_0%]' },
  { type: 'full', id: 14, src: '/images/portfolio/extracted_image_14.jpeg', flex: 'lg:flex-[1.4_1_0%]' },
  { type: 'full', id: 15, src: '/images/portfolio/extracted_image_15.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
  { type: 'full', id: 3, src: '/images/portfolio/extracted_image_3.jpeg', flex: 'lg:flex-[1_1_0%]' },
  { type: 'full', id: 20, src: '/images/portfolio/extracted_image_20.jpeg', flex: 'lg:flex-[1_1_0%]' },
  { type: 'full', id: 21, src: '/images/portfolio/extracted_image_21.jpeg', flex: 'lg:flex-[1.2_1_0%]' },
];


