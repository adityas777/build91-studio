import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/* ───────────────────────────────────────────────────────────────────────
   QuoteToolPromo
   ───────────────────────────────────────────────────────────────────────
   Slim conversion band between Testimonials and CtaSplit. Drives users
   into the Quote wizard (/quote). Visually quieter than CtaSplit so the
   page doesn't feel like two CTAs back-to-back.
   ─────────────────────────────────────────────────────────────────────── */

export function QuoteToolPromo() {
  return (
    <section
      aria-label="Get a tailored quote"
      className="section-base section-warm relative overflow-hidden border-y border-white/[0.06] py-8 md:py-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-[0.18]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-glow/40 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-glow/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-glow/25 bg-violet-glow/[0.08] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-violet-soft">
            ~60 seconds · No complex forms
          </div>
          <h2 className="text-display mt-6 text-3xl font-semibold leading-tight md:text-5xl">
            Get an instant ballpark quote{' '}
            <span className="text-accent-italic text-gradient">
              and a tailored proposal in 24 hours.
            </span>
          </h2>
          <p className="mt-4 text-base text-white/65 md:text-lg">
            Tell us what you&rsquo;re launching. We&rsquo;ll share an approx quote with you, and will get back with the
            asset bundle, sequence and timeline within 24 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/quote" className="btn-primary group w-64 justify-center py-3.5 text-sm sm:w-auto sm:px-7 shrink-0">
              Get a Custom Quote
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/contact" className="btn-secondary w-64 justify-center py-3.5 text-sm sm:w-auto sm:px-7 shrink-0">
              Or talk to us first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
