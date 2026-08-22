'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Smartphone } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';



const FEATURED_VIDEOS = [
  {
    id: 'penthouse-design-and-visualization',
    title: 'Penthouse Design and Visualization',
    type: 'youtube',
    embedId: '7CZp2JnXNLc',
    originalUrl: 'https://youtu.be/7CZp2JnXNLc?si=tA3laSFUU9rzdvzd',
    description: 'A luxurious duplex penthouse visual tour showcasing custom high-end furnishings, double-height spaces, and scenic vistas.',
  },
  {
    id: 'classic-luxury-living',
    title: 'Classic Luxury Living',
    type: 'youtube',
    embedId: 'pSb0ndJLkvs',
    originalUrl: 'https://youtu.be/pSb0ndJLkvs?si=NUWVPcD-I_lxfF-Z',
    description: 'A beautiful journey through classical architecture, classical pillars, and neoclassical interiors crafted with rich visual realism.',
  },
  {
    id: 'mumbai-residential-community',
    title: 'Mumbai Residential community',
    type: 'youtube',
    embedId: 'rJvT2l_uevw',
    originalUrl: 'https://youtu.be/rJvT2l_uevw?si=KOncc0HkrfDlOwmN',
    description: 'Architectural rendering and walkthrough of a prestigious residential landmark, spotlighting context and premium amenities.',
  },
];

interface OptimizedGalleryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onClick?: () => void;
  sizes?: string;
  className?: string;
}

function OptimizedGalleryImage({
  src,
  alt,
  width = 1600,
  height = 1000,
  priority = false,
  onClick,
  sizes = '100vw',
  className = ''
}: OptimizedGalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden bg-white/[0.02] transition-all duration-300 ${className}`}
      onClick={onClick}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Shimmering Skeleton Loader */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/[0.03] animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-white/25" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-101 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

function LightboxImage({ src, alt, isFullscreen }: { src: string; alt: string; isFullscreen: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        priority
        className={`object-contain transition-all duration-300 shadow-2xl ${
          isFullscreen ? 'rounded-none' : 'rounded-lg'
        } ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
}

export function PortfolioPageClient() {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [COLLECTIONS, setCOLLECTIONS] = useState<Record<string, Collection>>(STATIC_COLLECTIONS);

  // Dynamic YouTube Videos Section
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [loadingYoutube, setLoadingYoutube] = useState(true);
  const [activeYoutubeVideo, setActiveYoutubeVideo] = useState<any | null>(null);

  useEffect(() => {
    async function fetchYoutubeVideos() {
      try {
        const res = await fetch('/api/youtube');
        if (!res.ok) throw new Error('YouTube API response not OK');
        const data = await res.json();
        if (Array.isArray(data)) {
          setYoutubeVideos(data);
        }
      } catch (err) {
        console.warn('Could not fetch YouTube videos:', err);
      } finally {
        setLoadingYoutube(false);
      }
    }
    fetchYoutubeVideos();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const handleHashScroll = () => {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-gold', 'scale-[1.02]');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-gold', 'scale-[1.02]');
          }, 3000);
        }
      };
      handleHashScroll();
      const timer = setTimeout(handleHashScroll, 800);
      return () => clearTimeout(timer);
    }
  }, [activeCollection]);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          throw new Error('S3 listing response not OK');
        }
        const data = await res.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          // Merge S3 data with static fallback per-category
          const merged: Record<string, Collection> = {};
          for (const key of Object.keys(STATIC_COLLECTIONS)) {
            const s3Category = data[key];
            if (s3Category && Array.isArray(s3Category.images) && s3Category.images.length > 0) {
              merged[key] = s3Category;
            } else {
              // Fallback per-category if no S3 images exist
              merged[key] = STATIC_COLLECTIONS[key];
            }
          }
          setCOLLECTIONS(merged);
        }
      } catch (err) {
        console.warn('Could not load dynamic S3 portfolio. Falling back to local copy.', err);
      }
    }
    fetchCollections();
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
          <section className="section-base section-warm overflow-hidden pb-8 pt-28 md:pb-10 md:pt-36">
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

          {/* ── 3D Virtual Tour Embed ──────────────────────────────────── */}
          <AnimatedSection className="w-full my-6 md:my-10">
            {/* Mobile Landscape Hint Pill with Animated Rotating Phone Icon */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:hidden flex items-center justify-center gap-2.5 px-4 py-2.5 mb-4 mx-auto w-fit rounded-full bg-white/[0.06] border border-gold/30 backdrop-blur-md text-xs text-white/90 shadow-xl"
            >
              <motion.div
                animate={{ rotate: [0, 90, 90, 0, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="flex items-center justify-center text-gold"
              >
                <Smartphone className="w-4 h-4 text-gold" />
              </motion.div>

              <span>
                <strong className="text-gold font-semibold">Rotate phone to landscape</strong> for full 360° tour
              </span>
            </motion.div>

            <div
              className="relative w-full h-[520px] sm:h-[580px] md:h-[680px] lg:h-[780px] border-y border-white/10 bg-black/20 shadow-2xl overflow-hidden"
            >
              <iframe
                src="https://demo.build91.in/3BHK-Tour/index.htm"
                className="w-full h-full border-0 block"
                allowFullScreen
                loading="lazy"
                title="Build91 Studio 3D Virtual Tour"
              />
            </div>
          </AnimatedSection>

          {/* ── 3D Portfolio Grid Section ──────────────────────────────────── */}
          <section className="section-base overflow-hidden pt-2 pb-14 md:pb-18">
            <div className="container-page">
              {/* Category Grid Header */}
              <AnimatedSection className="text-center mb-8 md:mb-10">
                <h2 className="text-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                  3D Designs That Turn<br/>
                  <span className="text-accent-italic text-gradient">Vision Into Reality</span>
                </h2>
              </AnimatedSection>

              {/* Symmetrical 2-Column + Centerpiece Collections Grid */}
              <AnimatedSection>
                <div className="flex flex-col gap-10 md:gap-12">
                  {/* Row 1: Interiors & Exteriors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 md:gap-x-24 gap-y-12">
                    {/* Interiors */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('interiors')}
                      >
                        <Image
                          src={COLLECTIONS.interiors.heroImage}
                          alt={COLLECTIONS.interiors.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          priority
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
                        <Image
                          src={COLLECTIONS.exteriors.heroImage}
                          alt={COLLECTIONS.exteriors.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          priority
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

                  {/* Row 2: Amenities & Isometric */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 md:gap-x-24 gap-y-12">
                    {/* Amenities */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('amenities')}
                      >
                        <Image
                          src={COLLECTIONS.amenities.heroImage}
                          alt={COLLECTIONS.amenities.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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

                    {/* Isometric */}
                    <div className="flex flex-col">
                      <div 
                        className="aspect-[3/2] w-full overflow-hidden rounded-md cursor-pointer group relative bg-black/20"
                        onClick={() => setActiveCollection('isometric')}
                      >
                        <Image
                          src={COLLECTIONS.isometric.heroImage}
                          alt={COLLECTIONS.isometric.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                      <h3 
                        className="font-accent text-2xl md:text-3xl font-light tracking-[0.18em] uppercase mt-6 text-white hover:text-gold transition-colors duration-300 cursor-pointer inline-block w-fit"
                        onClick={() => setActiveCollection('isometric')}
                      >
                        {COLLECTIONS.isometric.title}
                      </h3>
                      <p className="font-body text-white/50 text-sm md:text-base font-light mt-3 leading-relaxed tracking-wide">
                        {COLLECTIONS.isometric.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* ── 3D Video Walkthroughs Section ──────────────────────────────────── */}
          <section className="section-base overflow-hidden pt-4 pb-14 md:pb-18 border-t border-white/10" id="video-walkthroughs">
            <div className="container-page">
              <AnimatedSection className="text-center mb-8 md:mb-10">
                <h2 className="text-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                  Featured 3D<br/>
                  <span className="text-accent-italic text-gradient">Video Walkthroughs</span>
                </h2>
                <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                  Explore immersive cinematic video walkthroughs showcasing township masterplans, luxury apartments, and penthouse visualizations.
                </p>
              </AnimatedSection>

              <AnimatedSection>
                <div className="flex flex-col gap-10 md:gap-14">
                  {FEATURED_VIDEOS.map((video) => (
                    <div
                      key={video.id}
                      id={video.id}
                      className="group flex flex-col items-center w-full max-w-[90vw] mx-auto px-4 md:px-12 py-8 md:py-12 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md transition-all duration-500 hover:border-violet-glow/20 hover:bg-white/[0.02] hover:shadow-[0_20px_60px_rgba(50,156,221,0.06)]"
                    >
                      {/* Video Title */}
                      <h3 className="text-display text-2xl md:text-4xl lg:text-5xl font-medium tracking-wide text-white mb-4 md:mb-6 text-center transition-colors duration-300 group-hover:text-gold">
                        {video.title}
                      </h3>

                      {/* Video Player covering screen width/height inside container */}
                      <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                        {video.type === 'youtube' ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1&mute=1&loop=1&playlist=${video.embedId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                            title={video.title}
                            className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-102"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <iframe
                            src={`https://drive.google.com/file/d/${video.embedId}/preview`}
                            title={video.title}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="autoplay"
                            allowFullScreen
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-100 pointer-events-none" />
                      </div>

                      {/* Video Info (Description & Label) */}
                      <div className="mt-6 text-center max-w-4xl">
                        <p className="text-base md:text-lg leading-relaxed text-white/70 font-light">
                          {video.description}
                        </p>
                        
                        <div className="mt-4 flex items-center justify-center gap-6">
                          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-soft border border-white/10 rounded-full px-3 py-1 bg-white/[0.02]">
                            {video.type === 'youtube' ? 'YouTube' : 'Google Drive'}
                          </span>
                          <a
                            href={video.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold font-medium uppercase tracking-wider transition-colors duration-300"
                          >
                            Open Original Link
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Dynamic YouTube Videos Section */}
              <AnimatedSection className="mt-14 border-t border-white/10 pt-10 pb-8">
                <div className="text-center mb-8 md:mb-10">
                  <span className="section-eyebrow">Our Channel</span>
                  <h2 className="text-display mt-4 text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                    Latest from <span className="text-accent-italic text-gradient">YouTube</span>
                  </h2>
                  <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-white/60">
                    Stay updated with walkthroughs, site visits, and project insights directly from our active feed.
                  </p>
                </div>

                {loadingYoutube ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-glow border-t-transparent" />
                    <p className="mt-4 text-sm text-white/50">Fetching latest videos...</p>
                  </div>
                ) : youtubeVideos.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-sm">
                    No recent videos found. Visit our channel directly.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {youtubeVideos.map((video) => (
                      <div
                        key={video.videoId}
                        onClick={() => setActiveYoutubeVideo(video)}
                        className="group cursor-pointer flex flex-col rounded-2xl border border-white/5 bg-white/[0.01] p-4 backdrop-blur-md transition-all duration-500 hover:border-violet-glow/20 hover:bg-white/[0.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(50,156,221,0.05)]"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Hover Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg text-black">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 ml-0.5">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>

                          {/* Short/Vertical Badge */}
                          {video.isShort && (
                            <span className="absolute top-3 right-3 bg-red-600/90 text-[9px] font-bold tracking-wider text-white px-2 py-0.5 rounded uppercase">
                              Short
                            </span>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="mt-4 flex-grow flex flex-col">
                          <h4 className="text-display text-sm md:text-base font-medium text-white/90 line-clamp-2 transition-colors duration-300 group-hover:text-gold">
                            {video.title}
                          </h4>
                          <span className="mt-4 text-[9px] font-semibold tracking-wider text-violet-soft uppercase">
                            {video.isShort ? 'YouTube Short' : 'Video Walkthrough'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedSection>

              {/* Dynamic YouTube Video Lightbox Modal */}
              {activeYoutubeVideo && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                  onClick={() => setActiveYoutubeVideo(null)}
                >
                  {/* Back Button */}
                  <button
                    onClick={() => setActiveYoutubeVideo(null)}
                    className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-xs md:text-sm font-medium text-white/85 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-lg hover:scale-105 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 md:w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Portfolio
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setActiveYoutubeVideo(null)}
                    className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Player Window */}
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ${
                      activeYoutubeVideo.isShort
                        ? 'max-w-[420px] aspect-[9/16] h-[80vh]'
                        : 'max-w-5xl aspect-video'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${activeYoutubeVideo.videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                      title={activeYoutubeVideo.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* Collection Gallery View (Independent Page layout) */
        <section className="section-base overflow-hidden pt-28 md:pt-36 pb-16 md:pb-20">
          <div className="container-page">
            <AnimatedSection>
              {/* Gallery Header */}
              <div className="border-b border-white/10 pb-6 mb-8">
                <button
                  onClick={() => {
                    setActiveCollection(null);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="flex items-center gap-3 text-sm font-medium tracking-[0.2em] text-gold/80 hover:text-gold transition-colors uppercase mb-6 mt-2 group"
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
            </AnimatedSection>

            {/* Scrollable Gallery Stack (Rendered directly to prevent opacity: 0 issues on tall containers) */}
            <div className="flex flex-col gap-6 md:gap-8 mt-8">
              {COLLECTIONS[activeCollection].images.map((src, index) => (
                <OptimizedGalleryImage
                  key={index}
                  src={src}
                  alt={`${COLLECTIONS[activeCollection].title} rendering ${index + 1}`}
                  width={1600}
                  height={1000}
                  priority={index === 0}
                  onClick={() => {
                    setActiveImageIndex(index);
                    setIsFullscreen(false);
                  }}
                  className="rounded-lg cursor-pointer group"
                />
              ))}
            </div>
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
                  isFullscreen ? 'w-full h-full' : 'w-[85vw] h-[80vh] max-w-[1600px] max-h-[1000px] md:w-[80vw] md:h-[85vh]'
                }`} 
                onClick={(e) => e.stopPropagation()}
              >
                <LightboxImage src={activeImageSrc} alt={`Enlarged 3D Render ${activeImageIndex + 1}`} isFullscreen={isFullscreen} />
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


