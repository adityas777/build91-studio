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
};

export default function ServicesPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-20 pt-40 md:pb-28 md:pt-48">
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

      <section className="section-base section-cool pb-32 pt-20">
        <ServicesPageClient />
      </section>

      <section className="section-base section-premium overflow-hidden py-28">
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
    </>
  );
}
