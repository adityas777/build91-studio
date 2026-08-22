import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { AboutStudioVideo } from '@/components/AboutStudioVideo';
import { StoryTimeline } from '@/components/StoryTimeline';
import { SITE, VALUES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Build91 Studio | 3D & Real Estate Marketing Studio',
  description:
    'Build91 Studio is a real estate marketing studio in Raipur and Bengaluru — 3D visualization, virtual tours and digital launchpads for developers across India, UAE and Australia.',
  alternates: {
    canonical: '/about',
  },
};

const team = [
  { role: 'Creative Direction', count: 3 },
  { role: '3D & Visualization', count: 12 },
  { role: 'Motion & Film', count: 4 },
  { role: 'Software Development', count: 4 },
  { role: 'Brand & Strategy', count: 3 },
  { role: 'Project Management', count: 2 },
];

export default function AboutPage() {
  return (
    <>
      {/* Opening — warm intro */}
      <section className="section-base section-warm overflow-hidden pb-8 pt-28 md:pb-12 md:pt-36">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-45" />
        <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/15 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-4xl">
            <span className="section-eyebrow">About Build91 Studio</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              We transform{' '}
              <span className="text-accent-italic text-gradient">blueprints</span>{' '}
              into immersive{' '}
              <span className="text-accent-italic text-gradient-gold">
                3D experiences.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Build91 Studio is a digital sales partner for real estate. We sit
              between architecture and audience — translating vision into the
              renders, films, tours and microsites that close.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission — violet wash */}
      <section className="section-base section-violet overflow-hidden py-10 md:py-16">
        <div className="pointer-events-none absolute right-0 top-1/4 -z-10 h-72 w-72 rounded-full bg-violet-glow/15 blur-[140px]" />
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <AnimatedSection>
            <span className="section-eyebrow">Mission</span>
            <h2 className="section-heading mt-4">
              Empowering real estate teams to{' '}
              <span className="text-accent-italic text-gradient">
                present better
              </span>{' '}
              and close faster.
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="space-y-5 text-base leading-relaxed text-white/65 md:text-lg">
            <p>
              Most real estate is sold before it&rsquo;s built. That means the
              conversation between developer and buyer is, by definition, a
              conversation about the future.
            </p>
            <p>
              Our job is to make that future feel real — clear enough to imagine,
              vivid enough to want, organised enough to share. We do this with a
              full-stack toolkit that no traditional rendering shop, ad agency or
              web studio offers alone.
            </p>
            <p>
              That toolkit is what we call the Digital Sales Suite — and it is
              the reason developers trust us
              with launch day.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story — cool, restrained */}
      <section className="section-base section-cool overflow-hidden py-10 md:py-16">
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-20" />
        <div className="container-page">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Our Story</span>
            <h2 className="section-heading mt-4">
              From visualization studio to{' '}
              <span className="text-accent-italic text-gradient-gold">
                full-stack sales partner.
              </span>
            </h2>
          </AnimatedSection>

          {/* Milestone slider — auto-advancing year timeline. Component +
              motion details in components/StoryTimeline.tsx. */}
          <AnimatedSection delay={0.1} className="mt-10 md:mt-16">
            <StoryTimeline
              milestones={[
                {
                  year: '2023',
                  title: 'Founded',
                  copy: 'Started as a pure 3D visualization studio serving boutique architects and designers.',
                },
                {
                  year: '2024',
                  title: 'Expanded',
                  copy: 'Added film, motion and post, large scale properties and international operations — becoming a one-stop creative house.',
                },
                {
                  year: '2025',
                  title: 'Suite Launched',
                  copy: 'Introduced the Digital Sales Suite — Interactive experiences, location intelligence, microsites, marketing stack and the complete launch system.',
                },
              ]}
            />
            <div className="sr-only">
              <h3>2023 — Founded</h3>
              <p>Started as a pure 3D visualization studio serving boutique architects and designers.</p>
              <h3>2024 — Expanded</h3>
              <p>Added film, motion and post, large scale properties and international operations — becoming a one-stop creative house.</p>
              <h3>2025 — Suite Launched</h3>
              <p>Introduced the Digital Sales Suite — Interactive experiences, location intelligence, microsites, marketing stack and the complete launch system.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Inside the Studio — team/office film.
          Deep-link target for the home TrustStrip pills (/about#studio).
          Portrait 9:16 on mobile, landscape 16:9 on desktop — sources,
          posters and the asset-swap notes live in
          components/AboutStudioVideo.tsx. */}
      <section
        id="studio"
        className="section-base section-violet overflow-hidden py-10 md:py-16 scroll-mt-24"
      >
        <div className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-72 w-72 rounded-full bg-violet-glow/15 blur-[140px]" />
        <div className="container-page">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Inside the Studio</span>
            <h2 className="section-heading mt-4">
              The people behind{' '}
              <span className="text-accent-italic text-gradient">the work.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65 md:text-lg">
              A glimpse of the team, the vibe and the rhythm that ship your
              launch.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="mx-auto mt-8 max-w-4xl md:mt-12">
            <AboutStudioVideo />
          </AnimatedSection>
        </div>
      </section>

      {/* Team — neutral */}
      <section className="section-base section-neutral overflow-hidden py-10 md:py-16">
        <div className="pointer-events-none absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-violet-deep/20 blur-[120px]" />
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <AnimatedSection>
            <span className="section-eyebrow">The Studio</span>
            <h2 className="section-heading mt-4">
              A multidisciplinary{' '}
              <span className="text-accent-italic text-gradient">
                creative team.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 md:text-lg">
              Designers, artists, filmmakers, software developers and strategists —
              working in the same room, on the same project, against the same
              brief.
            </p>
          </AnimatedSection>

          <AnimatedSection direction="left" delay={0.15}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {team.map((t, i) => (
                <div
                  key={t.role}
                  className="group relative aspect-auto min-h-[135px] sm:aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-700 p-5"
                >
                  {/* abstract avatar */}
                  <div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-80"
                    style={{
                      background:
                        i % 2 === 0
                          ? 'radial-gradient(circle, #7C3AED, transparent 60%)'
                          : 'radial-gradient(circle, #E0B872, transparent 60%)',
                    }}
                  />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="text-display text-3xl font-semibold text-white">
                      {t.count}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                      {t.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Offices — cosmic */}
      <section className="section-base section-cosmic overflow-hidden py-10 md:py-16">
        <div className="absolute inset-0 -z-10 starfield opacity-60" />
        <div className="container-page">
          <AnimatedSection className="mb-14 max-w-3xl">
            <span className="section-eyebrow">Where We Work</span>
            <h2 className="section-heading mt-4">
              Two offices. <span className="text-accent-italic text-gradient">Three continents</span> of clients.
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-2">
            {SITE.offices.map((o, i) => (
              <AnimatedSection key={o.city} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-700 p-8 md:p-10">
                  <div className="absolute inset-0 bg-grid-soft opacity-20" />
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-glow/20 blur-3xl" />
                  <div className="relative">
                    <MapPin className="h-5 w-5 text-gold" />
                    <div className="text-display mt-4 text-4xl font-semibold">{o.city}</div>
                    <div className="mt-1 text-sm text-white/55">{o.country}</div>
                    <div className="mt-6 text-sm text-white/70">{o.address}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values — violet */}
      <section className="section-base section-violet overflow-hidden py-10 md:py-16">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[60%] -translate-x-1/2 bg-gradient-to-b from-violet-glow/20 to-transparent blur-3xl" />
        <div className="container-page">
          <AnimatedSection className="mb-14 max-w-3xl">
            <span className="section-eyebrow">What We Stand For</span>
            <h2 className="section-heading mt-4">
              Four <span className="text-accent-italic text-gradient-gold">values</span>{' '}
              that show up in every project.
            </h2>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all hover:border-violet-glow/40 hover:bg-white/[0.05]">
                  <div className="text-display text-sm tracking-[0.3em] text-violet-soft">
                    0{i + 1}
                  </div>
                  <h3 className="text-display mt-5 text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{v.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — premium */}
      <section className="section-base section-premium overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-30" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="container-page text-center">
          <AnimatedSection className="mx-auto max-w-3xl">
            <h2 className="text-display text-4xl font-semibold md:text-6xl">
              Let&rsquo;s build something{' '}
              <span className="text-accent-italic text-gradient">together.</span>
            </h2>
            <div className="mt-8">
              <Link href="/contact" className="btn-primary group">
                Start a Conversation
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
