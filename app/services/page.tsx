import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ServicesPageClient } from '@/components/ServicesPageClient';
import { SolutionsRouter } from '@/components/SolutionsRouter';
import { AnimatedSection } from '@/components/AnimatedSection';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Build91 Studio services — five visual disciplines: Project Showcase, 3D Visualization, Virtual Experiences, Marketing Stack and Digital Launchpad. A complete digital sales suite for real estate.',
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-8 pt-28 md:pb-12 md:pt-36">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-50" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-30" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="section-eyebrow">What We Do</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]">
              A complete{' '}
              <span className="text-accent-italic text-gradient">sales suite</span>
              <br />
              for the way real estate sells.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Five visual disciplines. One studio. Everything a real estate team needs to
              present better, communicate faster and convert smarter — from the
              first blueprint to the final handover.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Interstitial — chip router (Phase 1) before deep service detail */}
      <SolutionsRouter framing="services" />

      <section className="section-base section-cool pb-16 pt-8 md:pb-20">
        <ServicesPageClient />
      </section>

      <section className="section-base section-premium overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-30" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display text-3xl font-semibold md:text-5xl">
              Not sure which discipline your project needs?
            </h2>
            <p className="mt-5 text-base text-white/65 md:text-lg">
              Most projects use three or more. Let&rsquo;s scope yours together.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/quote" className="btn-primary group">
                Get a Custom Quote
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Book a Strategy Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesJsonLd),
        }}
      />
    </>
  );
}

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Build91 Studio Real Estate Visual Disciplines',
  description: 'A complete digital sales suite for real estate developers and architects.',
  itemListElement: [
    {
      '@type': 'Service',
      position: 1,
      name: 'Project Showcase',
      description: 'Cinematic project film, elevation cut, amenities reel and developer story.',
      provider: { '@type': 'Organization', name: 'Build91 Studio', url: 'https://studio.build91.in' },
      url: 'https://studio.build91.in/services#project-showcase',
    },
    {
      '@type': 'Service',
      position: 2,
      name: '3D Visualization',
      description: 'Photoreal 3D interior, exterior, elevation, amenity, and isometric architectural renderings.',
      provider: { '@type': 'Organization', name: 'Build91 Studio', url: 'https://studio.build91.in' },
      url: 'https://studio.build91.in/services#3d-visualization',
    },
    {
      '@type': 'Service',
      position: 3,
      name: 'Virtual Experiences',
      description: 'Drone 360 views, interactive virtual tours, 3D video walkthroughs, and location intelligence.',
      provider: { '@type': 'Organization', name: 'Build91 Studio', url: 'https://studio.build91.in' },
      url: 'https://studio.build91.in/services#virtual-experiences',
    },
    {
      '@type': 'Service',
      position: 4,
      name: 'Marketing Stack',
      description: '2D drawings, 3D floor plans, 3D cut sections, brochures, and digital collateral.',
      provider: { '@type': 'Organization', name: 'Build91 Studio', url: 'https://studio.build91.in' },
      url: 'https://studio.build91.in/services#marketing-stack',
    },
    {
      '@type': 'Service',
      position: 5,
      name: 'Digital Launchpad',
      description: 'Interactive project microsite, dynamic inventory selector, and digital launch campaign engine.',
      provider: { '@type': 'Organization', name: 'Build91 Studio', url: 'https://studio.build91.in' },
      url: 'https://studio.build91.in/services#digital-launchpad',
    },
  ],
};
