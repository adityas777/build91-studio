import type { Metadata } from 'next';
import { QuoteWizard } from '@/components/QuoteWizard';
import { AnimatedSection } from '@/components/AnimatedSection';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description:
    'Tell us about your project — type, stage, scale and asset needs — and we will give an instant ballpark quote; and then share a tailored proposal within 24 hours. No hidden charges, no friction.',
  alternates: {
    canonical: '/quote',
  },
};

type SearchParams = Promise<{ type?: string; stage?: string }>;

export default async function QuotePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Next 15 App Router: searchParams is now an async API.
  const params = await searchParams;
  return (
    <>
      {/* Hero band */}
      <section className="section-base section-violet relative overflow-hidden pb-12 pt-40 md:pb-16 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-gold/12 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Get a Quote</span>
            <h1 className="text-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Tell us about your project.{' '}
              <br /><span className="text-accent-italic text-gradient">
                Get an instant ballpark quote & a tailored scope in 24 hours.
              </span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/65 md:text-lg">
              Five quick steps. No pricing forms, no gates — just a sharp scope
              you can take to your team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Wizard */}
      <section className="section-base section-cool overflow-hidden pb-32 pt-12">
        <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-deep/15 blur-[140px]" />
        <div className="container-page">
          <QuoteWizard
            prefill={{
              type: params.type ?? null,
              stage: params.stage ?? null,
            }}
          />
        </div>
      </section>
    </>
  );
}
