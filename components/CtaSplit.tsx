'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import { SITE, PROJECT_TYPES } from '@/lib/constants';
import { AnimatedSection } from './AnimatedSection';

/**
 * CtaSplit — dark split contact section.
 *   Left  : bold headline + persuasive copy + mini stats
 *   Right : compact form (Name, Phone, Email, Project Type, Message)
 *
 * The form currently fakes submission (logs to console). Wire to an API route
 * or a service like Formspree / Resend in a follow-up.
 */
export function CtaSplit() {
  return (
    <section
      id="contact"
      className="section-base section-premium relative overflow-hidden py-16 md:py-36"
    >
      <div className="absolute inset-0 -z-10 animated-gradient opacity-40" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-30" />
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-violet-glow/30 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold/15 blur-[160px]" />

      <div className="container-page">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-20">
          {/* ── Left rail: headline + copy + mini stats ────────────── */}
          <AnimatedSection className="lg:col-span-6">
            <span className="section-eyebrow">Let&rsquo;s Build Together</span>
            <h2 className="text-display mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl lg:text-6xl">
              Let&rsquo;s build something{' '}
              <span className="text-accent-italic text-gradient-gold">
                extraordinary.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
              Tell us what you&rsquo;re launching. We&rsquo;ll come back in 24
              hours with a moodboard, a proposed format mix, and a launch
              calendar.
            </p>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { v: '24h', l: 'First reply' },
                { v: '3', l: 'Countries served' },
                { v: '120+', l: 'Projects shipped' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-display text-2xl font-semibold text-white md:text-3xl">
                    {s.v}
                  </dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 space-y-2 text-sm text-white/65">
              <div>
                Or reach the studio directly —{' '}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-white underline-offset-4 hover:underline"
                >
                  {SITE.email}
                </a>
              </div>
              <div>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                  className="text-white underline-offset-4 hover:underline"
                >
                  {SITE.phoneDisplay}
                </a>{' '}
                · Mon&nbsp;–&nbsp;Sat
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right rail: form ───────────────────────────────────── */}
          <AnimatedSection direction="up" delay={0.1} className="lg:col-span-6">
            <ContactForm />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // REPLACE: wire to API route (/api/contact) or a service like Formspree/Resend.
    console.info('[Build91 Studio] contact form submission', data);
    await new Promise((r) => setTimeout(r, 900));
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden p-10 text-center"
      >
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-display mt-5 text-2xl font-semibold text-white">
          Brief received.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/65">
          We&rsquo;ll be in touch within 24 hours with first thoughts and next
          steps.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel relative overflow-hidden p-6 md:p-8"
    >
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br from-violet-glow/15 to-gold/10 blur-2xl" />

      <h3 className="text-display text-xl font-semibold text-white md:text-2xl">
        Start a project
      </h3>
      <p className="mt-1 text-sm text-white/55">
        It takes about 60 seconds. We&rsquo;ll do the rest.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field name="name" label="Name" required autoComplete="name" />
        <Field
          name="phone"
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
        />
        <Field
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          className="md:col-span-2"
        />
        <Select
          name="projectType"
          label="Project Type"
          className="md:col-span-2"
          options={PROJECT_TYPES}
        />
        <TextArea
          name="message"
          label="Tell us about your project"
          className="md:col-span-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-gold group mt-6 w-full justify-center disabled:opacity-70"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send the brief
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[11px] text-white/40">
        By submitting you agree to be contacted about your enquiry.
      </p>
    </form>
  );
}

/* ─── Form primitives ────────────────────────────────────────────────── */
function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  className = '',
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
        {label}
        {required && <span className="ml-0.5 text-gold">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-violet-glow/60 focus:bg-white/[0.06]"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  className = '',
}: {
  label: string;
  name: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
        {label}
      </span>
      <textarea
        name={name}
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-violet-glow/60 focus:bg-white/[0.06]"
        placeholder="What are you launching? Timeline? Anything we should know."
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  className = '',
}: {
  label: string;
  name: string;
  options: readonly string[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
        {label}
      </span>
      <select
        name={name}
        defaultValue=""
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-violet-glow/60 focus:bg-white/[0.06]"
      >
        <option value="" disabled className="bg-ink-900">
          Select a type…
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
