'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [COLLECTIONS, setCOLLECTIONS] = useState<Record<string, Collection>>(STATIC_COLLECTIONS);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          throw new Error('S3 listing response not OK');
        }
        const data = await res.json();
        // Only update state if we received a valid, non-empty collections map
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setCOLLECTIONS(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic S3 portfolio. Falling back to local copy.', err);
      }
    }
    fetchCollections();
  }, []);

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

  useEffect(() => {
    if (activeCollection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCollection]);

  // Keyboard navigation listener for lightbox (Arrows to slide, Esc to close)
  useEffect(() => {
    if (activeImageIndex === null || !activeCollection) return;
    const images = COLLECTIONS[activeCollection].images;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
      } else if (e.key === 'Escape') {
        setActiveImageIndex(null);
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, activeCollection, COLLECTIONS]);


  return (
    <>
      {activeCollection === null ? (
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
            <div className="container-page">
              {/* Category Grid Header */}
              <AnimatedSection className="text-center mb-16">
                <h2 className="text-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                  3D Designs That Turn<br/>
                  <span className="text-accent-italic text-gradient">Vision Into Reality</span>
                </h2>
              </AnimatedSection>

              {/* Symmetrical 2-Column + Centerpiece Collections Grid */}
              <AnimatedSection>
                <div className="flex flex-col gap-16">
                  {/* Row 1: Interiors & Exteriors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 md:gap-x-24 gap-y-12">
                    {/* Interiors */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('interiors')}
                      >
                        <img
                          src={COLLECTIONS.interiors.heroImage}
                          alt={COLLECTIONS.interiors.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <h3 
                        className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                        onClick={() => setActiveCollection('interiors')}
                      >
                        {COLLECTIONS.interiors.title}
                      </h3>
                      <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide">
                        {COLLECTIONS.interiors.description}
                      </p>
                    </div>

                    {/* Exteriors */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('exteriors')}
                      >
                        <img
                          src={COLLECTIONS.exteriors.heroImage}
                          alt={COLLECTIONS.exteriors.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <h3 
                        className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                        onClick={() => setActiveCollection('exteriors')}
                      >
                        {COLLECTIONS.exteriors.title}
                      </h3>
                      <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide">
                        {COLLECTIONS.exteriors.description}
                      </p>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Row 2: Elevations & Amenities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 md:gap-x-24 gap-y-12">
                    {/* Elevations */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('elevations')}
                      >
                        <img
                          src={COLLECTIONS.elevations.heroImage}
                          alt={COLLECTIONS.elevations.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <h3 
                        className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                        onClick={() => setActiveCollection('elevations')}
                      >
                        {COLLECTIONS.elevations.title}
                      </h3>
                      <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide">
                        {COLLECTIONS.elevations.description}
                      </p>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('amenities')}
                      >
                        <img
                          src={COLLECTIONS.amenities.heroImage}
                          alt={COLLECTIONS.amenities.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <h3 
                        className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                        onClick={() => setActiveCollection('amenities')}
                      >
                        {COLLECTIONS.amenities.title}
                      </h3>
                      <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide">
                        {COLLECTIONS.amenities.description}
                      </p>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Row 3: Isometric (Full width showcase banner) */}
                  <div className="flex flex-col">
                    <div 
                      className="aspect-[16/7] lg:aspect-[21/9] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                      onClick={() => setActiveCollection('isometric')}
                    >
                      <img
                        src={COLLECTIONS.isometric.heroImage}
                        alt={COLLECTIONS.isometric.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <h3 
                      className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                      onClick={() => setActiveCollection('isometric')}
                    >
                      {COLLECTIONS.isometric.title}
                    </h3>
                    <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide max-w-2xl">
                      {COLLECTIONS.isometric.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </>
      ) : (
        /* Collection Gallery View (Independent Page layout) */
        <section className="section-base overflow-hidden pt-40 md:pt-48 pb-32">
          <div className="container-page">
            <AnimatedSection>
              {/* Gallery Header */}
              <div className="border-b border-white/10 pb-8 mb-12">
                <button
                  onClick={() => {
                    setActiveCollection(null);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="flex items-center gap-3 text-sm font-medium tracking-[0.2em] text-gold/80 hover:text-gold transition-colors uppercase mb-10 mt-6 group"
                >
                  <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">←</span> Back to Portfolio
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h2 className="font-accent text-4xl md:text-6xl font-light uppercase tracking-[0.18em] text-white leading-none">
                      {COLLECTIONS[activeCollection].title}
                    </h2>
                  </div>
                  <div>
                    <p className="text-base md:text-lg leading-relaxed text-white/65 font-light">
                      {COLLECTIONS[activeCollection].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Gallery Stack */}
              <div className="flex flex-col gap-8 md:gap-12">
                {COLLECTIONS[activeCollection].images.map((src, index) => (
                  <div 
                    key={index} 
                    className="overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => {
                      setActiveImageIndex(index);
                      setIsFullscreen(false);
                    }}
                  >
                    <img
                      src={src}
                      alt={`${COLLECTIONS[activeCollection].title} rendering ${index + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-101"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {activeImageIndex !== null && activeCollection && (
        (() => {
          const images = COLLECTIONS[activeCollection].images;
          const activeImageSrc = images[activeImageIndex];
          
          const handlePrev = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
          };
          
          const handleNext = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
          };

          const handleClose = () => {
            setActiveImageIndex(null);
            setIsFullscreen(false);
          };

          const toggleFullscreen = (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          };

          return (
            <div 
              className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 transition-all duration-300 select-none ${
                isFullscreen ? 'p-0' : 'p-6 md:p-12 lg:p-16'
              }`}
              onClick={handleClose}
            >
              {/* Top-Left Action Button: Fullscreen Toggle */}
              <button 
                className="absolute top-6 left-6 z-50 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full w-12 h-12 transition-all duration-300"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  /* Collapse Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5m0 4.5h4.5m-4.5 0l6-6M9 15v4.5M9 15H4.5M9 15l-6 6m12-6v4.5m0-4.5h4.5m-4.5 0l6 6" />
                  </svg>
                ) : (
                  /* Expand Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 0v4.5m0-4.5h-4.5m4.5 0L15 15" />
                  </svg>
                )}
              </button>

              {/* Top-Right Action Button: Close */}
              <button 
                className="absolute top-6 right-6 z-50 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full w-12 h-12 transition-all duration-300"
                onClick={handleClose}
                aria-label="Close lightbox"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Left Arrow Button (Only if more than 1 image) */}
              {images.length > 1 && (
                <button 
                  className="absolute left-4 md:left-8 z-50 flex items-center justify-center text-white/60 hover:text-white bg-black/30 hover:bg-black/50 hover:scale-105 active:scale-95 rounded-full w-12 h-12 md:w-14 md:h-14 transition-all duration-300"
                  onClick={handlePrev}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              {/* Right Arrow Button (Only if more than 1 image) */}
              {images.length > 1 && (
                <button 
                  className="absolute right-4 md:right-8 z-50 flex items-center justify-center text-white/60 hover:text-white bg-black/30 hover:bg-black/50 hover:scale-105 active:scale-95 rounded-full w-12 h-12 md:w-14 md:h-14 transition-all duration-300"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}

              {/* Image Container */}
              <div 
                className={`relative flex items-center justify-center transition-all duration-500 cursor-default select-none ${
                  isFullscreen ? 'w-full h-full' : 'max-w-[85vw] max-h-[80vh] md:max-w-[80vw] md:max-h-[85vh]'
                }`} 
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImageSrc}
                  alt={`Enlarged 3D Render ${activeImageIndex + 1}`}
                  className={`object-contain transition-all duration-500 shadow-2xl ${
                    isFullscreen ? 'w-full h-full rounded-none' : 'w-auto h-auto max-w-full max-h-full rounded-lg'
                  }`}
                  loading="eager"
                />
              </div>
            </div>
          );
        })()
      )}
    </>
  );
}

interface Collection {
  id: string;
  title: string;
  description: string;
  heroImage: string;
  images: string[];
}

const STATIC_COLLECTIONS: Record<string, Collection> = {
  interiors: {
    id: 'interiors',
    title: 'Interiors',
    description: 'Exquisite living room interior designs that blend modern elegance with timeless sophistication. Spaces that embody luxury and style, tailored to your unique taste and lifestyle.',
    heroImage: '/images/portfolio/extracted_image_12.png',
    images: [
      '/images/portfolio/extracted_image_12.png',
      '/images/portfolio/extracted_image_11.png',
      '/images/portfolio/extracted_image_14.jpeg',
      '/images/portfolio/extracted_image_4.jpeg',
      '/images/portfolio/extracted_image_13.jpeg',
      '/images/portfolio/extracted_image_1.jpeg',
      '/images/portfolio/extracted_image_9.png',
      '/images/portfolio/extracted_image_16.jpeg',
      '/images/portfolio/extracted_image_10.png',
      '/images/portfolio/extracted_image_18.jpeg',
      '/images/portfolio/extracted_image_20.jpeg',
      '/images/portfolio/extracted_image_21.jpeg',
    ]
  },
  exteriors: {
    id: 'exteriors',
    title: 'Exteriors',
    description: 'Our Exterior portfolio showcases a collection of realistic and detailed projects that highlight our dedication to precision and creativity in every design.',
    heroImage: '/images/portfolio/extracted_image_6.jpeg',
    images: [
      '/images/portfolio/extracted_image_6.jpeg',
      '/images/portfolio/extracted_image_15.jpeg',
      '/images/portfolio/extracted_image_17.jpeg',
      '/images/portfolio/extracted_image_3.jpeg',
    ]
  },
  elevations: {
    id: 'elevations',
    title: 'Elevations',
    description: 'Highly detailed 3D elevations illustrating structural facades, building orientations, and material distributions with pinpoint accuracy.',
    heroImage: '/images/portfolio/extracted_image_7.png',
    images: [
      '/images/portfolio/extracted_image_7.png',
      '/images/portfolio/extracted_image_2.jpeg',
      '/images/portfolio/extracted_image_19.jpeg',
    ]
  },
  amenities: {
    id: 'amenities',
    title: 'Amenities',
    description: 'Immersive spaces designed for communities, detailing pool decks, clubhouses, green areas, and lifestyle facilities with CGI photorealism.',
    heroImage: '/images/portfolio/extracted_image_8.jpeg',
    images: [
      '/images/portfolio/extracted_image_8.jpeg',
    ]
  },
  isometric: {
    id: 'isometric',
    title: 'Isometric',
    description: 'Fascinating 3D spatial cutaway plans offering a complete overview of layouts, room arrangements, and design proportions.',
    heroImage: '/images/portfolio/extracted_image_13.jpeg',
    images: [
      '/images/portfolio/extracted_image_13.jpeg',
    ]
  }
};


