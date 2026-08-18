import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { AnimatedSection } from '@/components/AnimatedSection';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to Build91 Studio about your next real estate project. Studios in Bengaluru and Raipur, serving developers across India, UAE and Australia.',
};

export default function ContactPage() {
  return (
    <>
      <section className="section-base section-violet overflow-hidden pb-12 pt-40 md:pb-20 md:pt-48">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
        <div className="absolute inset-0 -z-10 bg-grid-soft opacity-25" />
        <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-violet-glow/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-gold/12 blur-[140px]" />

        <div className="container-page">
          <AnimatedSection className="max-w-3xl">
            <span className="section-eyebrow">Get in Touch</span>
            <h1 className="text-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Let&rsquo;s talk about{' '}
              <span className="text-accent-italic text-gradient">your project.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
              Tell us what you&rsquo;re building. We&rsquo;ll come back with what it
              could look like — fast.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-base section-cool overflow-hidden pb-32 pt-12">
        <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-violet-deep/15 blur-[140px]" />
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Left — info */}
          <AnimatedSection className="space-y-10">
            <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-md md:p-9">
              <div>
                <div className="section-eyebrow">Direct</div>
                <ul className="mt-5 space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
                      <Phone className="h-4 w-4 text-violet-soft" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Phone
                      </div>
                      <a
                        href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                        className="text-lg text-white hover:text-gold"
                      >
                        {SITE.phoneDisplay}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3">
                      <Mail className="h-4 w-4 text-violet-soft" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Email
                      </div>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="text-lg text-white hover:text-gold"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 border-t border-white/10 pt-5">
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-violet-glow/50 hover:text-violet-soft"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={SITE.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-violet-glow/50 hover:text-violet-soft"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={SITE.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:border-violet-glow/50 hover:text-violet-soft"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Offices */}
            <div className="grid gap-4 sm:grid-cols-2">
              {SITE.offices.map((o) => (
                <div
                  key={o.city}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <MapPin className="h-4 w-4 text-violet-soft" />
                  <div className="text-display mt-3 text-xl font-semibold">{o.city}</div>
                  <div className="mt-1 text-sm text-white/55">{o.address}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Right — form */}
          <AnimatedSection direction="left" delay={0.1}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
