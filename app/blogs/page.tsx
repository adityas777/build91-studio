import type { Metadata } from 'next';
import { AnimatedSection } from '@/components/AnimatedSection';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Insights, ideas and news from Build91 Studio on real estate technology, 3D renders, and digital launch strategies.',
};

export default function BlogsPage() {
  return (
    <>
      <section className="section-base section-warm overflow-hidden pb-20 pt-40 md:pb-28 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-45" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/15 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="section-eyebrow">Blogs</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Insights &{' '}
              <span className="text-accent-italic text-gradient">industry</span>{' '}
              updates{' '}
              <span className="text-accent-italic text-gradient-gold">
                unveiled.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Explore our latest ideas, industry trends, and strategic perspectives on the future of digital real estate sales.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-base section-neutral overflow-hidden py-24 text-center">
        <div className="container-page">
          <AnimatedSection className="max-w-md mx-auto">
            <h2 className="text-2xl font-medium text-white">Blogs Coming Soon</h2>
            <p className="mt-4 text-white/60 text-sm leading-relaxed">
              We are currently crafting high-value industry perspectives and technical breakdowns. Check back shortly for our first publication.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
