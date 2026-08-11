'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function PortfolioPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

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
                    onClick={() => setActiveImage(src)}
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

interface Collection {
  id: string;
  title: string;
  description: string;
  heroImage: string;
  images: string[];
}

const COLLECTIONS: Record<string, Collection> = {
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


