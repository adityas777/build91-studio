'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Send, 
  Loader2, 
  AlertCircle,
  Building2,
  UserCheck,
  Link2Off
} from 'lucide-react';
import { SITE } from '@/lib/constants';

type RatingValue = 'happy' | 'neutral' | 'sad';
type RecommendValue = 'yes' | 'maybe' | 'no';

interface FeedbackClientProps {
  initialClient?: string;
  initialOrg?: string;
  initialDate?: string;
}

const SATISFACTION_OPTIONS: { value: RatingValue; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😄' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😞' },
];

const RECOMMEND_OPTIONS: { value: RecommendValue; label: string; emoji: string }[] = [
  { value: 'yes', label: 'Yes', emoji: '👍' },
  { value: 'maybe', label: 'Maybe', emoji: '🤔' },
  { value: 'no', label: 'No', emoji: '👎' },
];

export function FeedbackClient({
  initialClient = '',
  initialOrg = '',
  initialDate = '',
}: FeedbackClientProps) {
  const searchParams = useSearchParams();

  const urlClient = (
    searchParams?.get('client') ||
    searchParams?.get('name') ||
    searchParams?.get('customer') ||
    searchParams?.get('user') ||
    ''
  ).trim();

  const urlOrg = (
    searchParams?.get('org') ||
    searchParams?.get('organization') ||
    searchParams?.get('project') ||
    searchParams?.get('company') ||
    searchParams?.get('data') ||
    ''
  ).trim();

  const urlDate = (searchParams?.get('date') || '').trim();

  const clientName = (urlClient || initialClient || '').trim();
  const organization = (urlOrg || initialOrg || '').trim();
  const deliveryDate = (urlDate || initialDate || '').trim();

  // Valid params require at least client name or project / organization data
  const hasValidParams = Boolean(clientName || organization);

  // Ratings
  const [overallSatisfaction, setOverallSatisfaction] = useState<RatingValue | null>(null);
  const [quality, setQuality] = useState<RatingValue | null>(null);
  const [turnaroundTime, setTurnaroundTime] = useState<RatingValue | null>(null);
  const [communication, setCommunication] = useState<RatingValue | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendValue | null>(null);
  const [comments, setComments] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasValidParams || (!clientName && !organization)) {
      setErrorMessage('Feedback cannot be submitted without a valid personalized client link.');
      return;
    }

    if (!overallSatisfaction) {
      setErrorMessage('Please select your Overall Satisfaction rating.');
      return;
    }
    if (!quality) {
      setErrorMessage('Please rate the Visual & 3D Quality.');
      return;
    }
    if (!turnaroundTime) {
      setErrorMessage('Please rate Turnaround Time.');
      return;
    }
    if (!communication) {
      setErrorMessage('Please rate Communication & Responsiveness.');
      return;
    }
    if (!recommendation) {
      setErrorMessage('Please let us know if you would recommend Build91 Studio.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName || '',
          organization: organization || '',
          date: deliveryDate || '',
          overallSatisfaction,
          quality,
          turnaroundTime,
          communication,
          recommendation,
          comments: comments.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback. Please try again.');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allSelected =
    overallSatisfaction && quality && turnaroundTime && communication && recommendation;

  return (
    <div className="min-h-screen bg-ink-900 text-white flex flex-col justify-between selection:bg-gold/30 selection:text-gold relative overflow-x-hidden font-body">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-radial-gradient from-violet-glow/15 via-violet-deep/5 to-transparent blur-[140px] opacity-70" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-radial-gradient from-gold/10 via-transparent to-transparent blur-[140px] opacity-50" />
        <div className="absolute inset-0 bg-grid-soft opacity-15" />
      </div>

      {/* Header — Clean Build91 Studio Logo & Name */}
      <header className="w-full border-b border-white/10 bg-ink-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/20 p-0.5 bg-white/5 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={SITE.logo}
                alt="Build91 Studio Logo"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-accent text-lg sm:text-xl font-light tracking-[0.2em] uppercase text-white leading-none group-hover:text-gold transition-colors">
                BUILD91
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold/80 font-medium">
                Studio
              </span>
            </div>
          </Link>

          <span className="text-xs uppercase tracking-widest text-white/50 font-medium">
            Client Review
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!hasValidParams ? (
            /* ── Missing Parameters / Locked State ────────────────────────────── */
            <motion.div
              key="missing-params"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-amber-500/30 shadow-2xl relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Centered Locked / Alert Icon */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 mb-4 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                  <Link2Off className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                  Personalized Link Required
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-display text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                Client Feedback Link Required
              </h2>

              {/* Description */}
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8 font-light">
                To ensure your review is accurately attributed to your project deliverables, feedback cannot be submitted without a verified client link. If you are a client of Build91 Studio, please use the custom link sent to you directly via WhatsApp or Email.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-gradient-to-r from-gold via-gold-light to-gold text-ink-900 font-accent text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase py-3.5 px-8 rounded-full shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Return to Homepage
                </Link>
                <a
                  href="https://wa.me/919106093310?text=Hi%20Build91%20Studio%2C%20I%20need%20a%20feedback%20link%20for%20my%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-accent text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase py-3.5 px-6 rounded-full border border-white/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Contact Studio
                </a>
              </div>
            </motion.div>
          ) : submitted ? (
            /* ── Polished Centered Thank You State ────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-gold/30 shadow-2xl relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Centered Check Icon */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mb-4 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-gold font-semibold bg-gold/10 px-3.5 py-1 rounded-full border border-gold/20">
                  Feedback Recorded
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-display text-2xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
                {clientName ? `Thank You, ${clientName}!` : 'Thank You for Your Feedback!'}
              </h2>

              {/* Description */}
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8 font-light">
                {organization ? (
                  <>
                    Your valuable review for <strong className="text-white font-medium">{organization}</strong> has been shared directly with our studio leadership team.
                  </>
                ) : (
                  'Your insights help our 3D visualization and render artists continuously elevate the benchmark for your future releases.'
                )}
              </p>

              {/* On-brand Gold Action Button */}
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="bg-gradient-to-r from-gold via-gold-light to-gold text-ink-900 font-accent text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase py-3.5 px-8 rounded-full shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Explore Build91 Studio
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ── Compact Streamlined Feedback Form ────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* Header Title & Client Greeting */}
              <div className="text-center sm:text-left">
                <h1 className="text-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {clientName ? `Project Feedback · ${clientName}` : 'Project Feedback'}
                </h1>
                
                {organization && (
                  <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-gold/90 bg-gold/10 px-3 py-1 rounded-full border border-gold/20 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-gold" />
                    <span>{organization}</span>
                  </div>
                )}

                <p className="mt-2.5 text-white/60 text-xs sm:text-sm font-light leading-relaxed">
                  Your quick rating helps us build better for every delivery after yours.
                </p>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* 1. Overall Satisfaction */}
                <InlineRatingRow
                  label="Overall Satisfaction"
                  options={SATISFACTION_OPTIONS}
                  selectedValue={overallSatisfaction}
                  onSelect={(val) => setOverallSatisfaction(val as RatingValue)}
                />

                {/* 2. Visual & 3D Quality */}
                <InlineRatingRow
                  label="Visual & 3D Quality"
                  options={SATISFACTION_OPTIONS}
                  selectedValue={quality}
                  onSelect={(val) => setQuality(val as RatingValue)}
                />

                {/* 3. Turnaround Time */}
                <InlineRatingRow
                  label="Turnaround Time"
                  options={SATISFACTION_OPTIONS}
                  selectedValue={turnaroundTime}
                  onSelect={(val) => setTurnaroundTime(val as RatingValue)}
                />

                {/* 4. Communication & Responsiveness */}
                <InlineRatingRow
                  label="Communication & Responsiveness"
                  options={SATISFACTION_OPTIONS}
                  selectedValue={communication}
                  onSelect={(val) => setCommunication(val as RatingValue)}
                />

                {/* 5. Would you recommend Build91? */}
                <InlineRatingRow
                  label="Would you recommend Build91?"
                  options={RECOMMEND_OPTIONS}
                  selectedValue={recommendation}
                  onSelect={(val) => setRecommendation(val as RecommendValue)}
                />

                {/* 6. Compact Optional Comments */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="comments" className="text-white/80 font-medium">
                      Anything else you&apos;d like to share? <span className="text-white/40 font-light">(optional)</span>
                    </label>
                    <span className="text-white/30 font-mono text-[10px]">
                      {comments.length} / 2,000
                    </span>
                  </div>
                  <textarea
                    id="comments"
                    rows={2}
                    maxLength={2000}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Share any thoughts, suggestions, or notes..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs sm:text-sm text-white placeholder-white/25 focus:border-gold focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 px-6 rounded-xl font-accent font-semibold tracking-[0.2em] uppercase text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                      allSelected
                        ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-ink-900 hover:shadow-gold/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                        : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-white/35 font-light mt-2.5">
                    No login required · Your review is submitted directly to the Build91 team.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/10 py-4 text-center text-xs text-white/40 font-light">
        <p>© {new Date().getFullYear()} Build91 Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ── Inline Single-Row Rating Field Component ────────────────────────────── */
function InlineRatingRow({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string; emoji: string }[];
  selectedValue: string | null;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
      {/* Label */}
      <div className="text-xs sm:text-sm font-medium text-white/90">
        {label} <span className="text-gold/80 ml-0.5">*</span>
      </div>

      {/* 3 Clickable Emoji Buttons */}
      <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;

          let activeStyle = 'bg-gold text-ink-900 border-gold shadow-md shadow-gold/20 font-semibold';
          if (opt.value === 'happy' || opt.value === 'yes') {
            activeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-500/20 font-semibold';
          } else if (opt.value === 'sad' || opt.value === 'no') {
            activeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-md shadow-rose-500/20 font-semibold';
          } else if (opt.value === 'neutral' || opt.value === 'maybe') {
            activeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20 font-semibold';
          }

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all duration-200 cursor-pointer ${
                isSelected
                  ? activeStyle
                  : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/[0.06] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{opt.emoji}</span>
              <span className="tracking-wide text-[11px] sm:text-xs">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
