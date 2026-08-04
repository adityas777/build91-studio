'use client';

import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Hourglass,
  MessageCircle,
  Plane,
  Sparkles,
} from 'lucide-react';
import { SITE } from '@/lib/constants';
import {
  PRICING_VERSION,
  QUOTE_VALIDITY_DAYS,
  effectiveDate,
  formatINR,
  quoteValidUntil,
  totalFor,
  type ScaleInputs,
} from '@/lib/quotePricing';
import { type ProjectTypeId, type StageId } from '@/lib/solutionsBundles';

/* ───────────────────────────────────────────────────────────────────────
   QuoteScopePreview — the quote reveal moment
   ───────────────────────────────────────────────────────────────────────
   FIRST time the customer sees a number. Per product rules:
     • Only the total — never per-line prices
     • GST is fine print (NOT added to total)
     • Drone shoot mentioned ONCE here (never inside the wizard)
   ─────────────────────────────────────────────────────────────────────── */

const CALENDLY_HREF = 'https://calendar.app.google/kNy2VxLrEwPi9zMz5';

type QuoteSnapshot = {
  typeId: ProjectTypeId;
  stage: StageId;
  scaleInputs: ScaleInputs;
  selectedAssetIds: string[];
  subOptionsByAsset: Record<string, string[]>;
};

type Props = {
  firstName: string;
  email: string;
  /** Shown in the proposal line in review mode ("…arrives at email and phone"). */
  phone?: string;
  projectTypeLabel: string;
  quote: QuoteSnapshot | null;
  /** 'review' = "Other" project type: no quote figure — the requirement
   *  goes to the studio for manual review instead. Default 'quote'. */
  mode?: 'quote' | 'review';
};

export function QuoteScopePreview({
  firstName,
  email,
  phone,
  projectTypeLabel,
  quote,
  mode = 'quote',
}: Props) {
  const isReview = mode === 'review';
  const waMessage = encodeURIComponent(
    isReview
      ? 'Hi Build91 — I just sent across a custom project requirement. Looking forward to the proposal.'
      : `Hi Build91 — I just submitted a quote request for a ${projectTypeLabel} project. Looking forward to the proposal.`,
  );
  const waNumber = SITE.phone.replace(/\D/g, '');
  const waHref = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-2xl text-center"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-gold">
        {isReview ? (
          <Hourglass className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        )}
        {isReview ? 'Request received' : 'Quote ready'}
      </div>

      <h2 className="text-display mt-7 text-3xl font-semibold leading-tight md:text-5xl">
        Thanks,{' '}
        <span className="text-accent-italic text-gradient-gold">
          {firstName || 'there'}
        </span>
        .
      </h2>

      {isReview ? <ReviewNotice /> : quote && <QuoteReveal quote={quote} />}

      <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-white/55 md:text-base">
        The detailed proposal — scope, sequencing and milestones — arrives at{' '}
        <span className="text-white/75">{email}</span>
        {isReview && phone ? (
          <>
            {' '}
            and <span className="text-white/75">{phone}</span>
          </>
        ) : null}{' '}
        within 24 hours.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={CALENDLY_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary group w-full sm:w-auto"
        >
          Book a 15-min demo
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full sm:w-auto"
        >
          <MessageCircle className="h-4 w-4" />
          Continue on WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

/* ── Review notice (the "Other" flow's stand-in for the quote panel) ── */

function ReviewNotice() {
  return (
    <div className="mt-10 rounded-3xl border border-violet-glow/25 bg-violet-glow/[0.05] p-6 text-center md:p-8">
      <div className="text-xs font-medium uppercase tracking-[0.3em] text-violet-soft">
        Your Requirement
      </div>
      <div className="text-display mt-3 text-xl font-semibold text-white md:text-2xl">
        Under review
      </div>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
        We may contact you for more details.
      </p>
    </div>
  );
}

/* ── Quote reveal panel ─────────────────────────────────────────────── */

function QuoteReveal({ quote }: { quote: QuoteSnapshot }) {
  const totals = totalFor({
    type: quote.typeId,
    scale: quote.scaleInputs,
    selectedAssetIds: quote.selectedAssetIds,
    subOptionsByAsset: quote.subOptionsByAsset,
  });
  const validUntil = quoteValidUntil();

  if (totals.total === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-center md:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.3em] text-violet-soft">
          Your Quote
        </div>
        <div className="text-display mt-3 text-xl font-semibold text-white md:text-2xl">
          Custom scope
        </div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
          We&rsquo;ll quote this combination on a call.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-transparent p-6 text-center md:p-9">
      <div className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
        Your Quote
      </div>

      <div
        className="text-display mt-4 text-5xl font-semibold leading-none text-white tabular-nums md:text-6xl"
        title={formatINR(totals.total, 'full')}
      >
        {formatINR(totals.total)}
      </div>

      <div className="mt-3 text-xs text-white/55">
        * Quotes are exclusive of GST (18%)
      </div>

      {totals.requiresDroneShoot && (
        <div className="mx-auto mt-5 inline-flex max-w-md items-start gap-2 rounded-2xl border border-gold/20 bg-gold/[0.04] px-4 py-3 text-left">
          <Plane className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
          <p className="text-xs leading-relaxed text-white/75 md:text-sm">
            <span className="text-gold">+ Drone shoot</span> (video + images)
            is quoted by location — we&rsquo;ll confirm in the proposal using
            the Maps link you shared.
          </p>
        </div>
      )}

      <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/40">
        Valid {QUOTE_VALIDITY_DAYS} days · until {validUntil} · {PRICING_VERSION} · {effectiveDate()}
      </div>
    </div>
  );
}
