'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import {
  PROJECT_TYPES,
  PROJECT_TYPE_ORDER,
  STAGES,
  STAGE_ORDER,
  quoteHref,
  type Bundle,
  type ProjectTypeId,
  type StageId,
} from '@/lib/solutionsBundles';
import { MobileInfoTooltip } from '@/components/MobileInfoTooltip';

/* ───────────────────────────────────────────────────────────────────────
   SolutionsRouter
   ───────────────────────────────────────────────────────────────────────
   "I'm launching a…" / "We're in [stage]…" — the page that routes
   self-identifying developers straight into a Quote-tool deep-link with
   their chip context pre-filled.

   UX rules (FAANG-grade):
     • Chips, not dropdowns — every option visible at once
     • Two tabs (Type / Stage) on one component — no wizard feel
     • Selecting a chip reveals an expanded card under it; only one card
       open at a time per tab
     • Mobile: chips wrap onto multiple lines; expanded card slides under
     • All chip CTAs deep-link to /quote?type=...&stage=... (Phase 2)
   ─────────────────────────────────────────────────────────────────────── */

type Mode = 'type' | 'stage';

type Props = {
  /** Section heading variant — slightly different framing for home vs services */
  framing?: 'home' | 'services';
  /** Default starting tab. */
  defaultMode?: Mode;
};

export function SolutionsRouter({
  framing = 'home',
  defaultMode = 'type',
}: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [activeType, setActiveType] = useState<ProjectTypeId | null>(null);
  const [activeStage, setActiveStage] = useState<StageId | null>(null);

  const activeBundle: Bundle | null =
    mode === 'type'
      ? activeType
        ? PROJECT_TYPES[activeType]
        : null
      : activeStage
        ? STAGES[activeStage]
        : null;

  return (
    <section
      id="solutions"
      aria-label="Find your solution"
      className="section-base section-warm relative overflow-hidden py-14 md:py-32"
    >
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-0 h-72 w-72 rounded-full bg-violet-glow/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-0 h-72 w-72 rounded-full bg-gold/10 blur-[140px]" />

      <div className="container-page relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">
            {framing === 'home' ? 'GET A QUOTE' : 'Choose Your Path'}
          </span>
          <h2 className="section-heading mt-4">
            {framing === 'home' ? (
              <>
                What are you{' '}
                <span className="text-accent-italic text-gradient">launching?</span>
              </>
            ) : (
              <>
                Scope the right{' '}
                <span className="text-accent-italic text-gradient">bundle.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-base text-white/60 md:text-lg">
            Tell us the project details — we&rsquo;ll
            walk you through most common requirements in a few clicks; and get you a ballpark quote.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mt-6 flex justify-center md:mt-10">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
            <ModeButton
              isActive={mode === 'type'}
              onClick={() => setMode('type')}
              label="By Project Type"
            />
            <ModeButton
              isActive={mode === 'stage'}
              onClick={() => setMode('stage')}
              label="By Stage"
            />
          </div>
        </div>

        {/* Chip instruction */}
        <div className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/80 md:mt-10">
          Select a {mode === 'type' ? 'project type' : 'stage'} below to explore scope:
        </div>

        {/* Chip rail */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5 px-4 md:px-0">
          {mode === 'type'
            ? PROJECT_TYPE_ORDER.map((id) => {
              const b = PROJECT_TYPES[id];
              return (
                <Chip
                  key={id}
                  bundle={b}
                  active={activeType === id}
                  onClick={() =>
                    setActiveType((prev) => (prev === id ? null : id))
                  }
                />
              );
            })
            : STAGE_ORDER.map((id) => {
              const b = STAGES[id];
              return (
                <Chip
                  key={id}
                  bundle={b}
                  active={activeStage === id}
                  onClick={() =>
                    setActiveStage((prev) => (prev === id ? null : id))
                  }
                />
              );
            })}
        </div>

        {/* Expanded card */}
        <div className="mt-8 md:mt-10">
          <AnimatePresence mode="wait">
            {activeBundle && (
              <BundleCard
                key={`${mode}-${activeBundle.id}`}
                bundle={activeBundle}
                href={
                  mode === 'type'
                    ? quoteHref({ type: activeBundle.id as ProjectTypeId })
                    : quoteHref({ stage: activeBundle.id as StageId })
                }
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ── Mode segmented control ────────────────────────────────────────────── */

function ModeButton({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full px-5 py-2 text-xs font-medium tracking-wide transition-colors md:text-sm ${isActive ? 'text-white' : 'text-white/55 hover:text-white/80'
        }`}
    >
      {isActive && (
        <motion.span
          layoutId="solutions-mode-active"
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-deep to-violet-glow shadow-[0_8px_30px_-10px_rgba(124,58,237,0.7)]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      {label}
    </button>
  );
}

/* ── Chip ──────────────────────────────────────────────────────────────── */

function Chip({
  bundle,
  active,
  onClick,
}: {
  bundle: Bundle;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = bundle.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97] duration-200 ${active
          ? 'border-violet-glow/60 bg-violet-glow/[0.12] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.6)]'
          : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:bg-white/[0.05] hover:text-white'
        }`}
    >
      <Icon
        className={`h-4 w-4 transition-colors ${active ? 'text-violet-soft' : 'text-white/45 group-hover:text-white/70'
          }`}
        strokeWidth={1.8}
      />
      {bundle.label}
    </button>
  );
}

/* ── Expanded bundle card ──────────────────────────────────────────────── */

function BundleCard({ bundle, href }: { bundle: Bundle; href: string }) {
  const Icon = bundle.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-9"
    >
      <div className="flex flex-row-reverse items-start justify-between gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-glow/25 bg-violet-glow/[0.08] text-violet-soft">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-display text-xl font-semibold md:text-2xl">
            {bundle.label}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">
            {bundle.blurb}
          </p>
        </div>
      </div>

      {/* Asset list — structured (label + detail) for project types,
          flat string list for stages. The discriminated union on
          `bundle.kind` keeps TS happy and rendering clean.

          Mobile: detail is hidden, accessible via the ⓘ tooltip.
          Desktop: detail renders inline as sub-line. */}
      {bundle.kind === 'project-type' ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {bundle.assetOptions.map((opt) => (
            <li
              key={opt.id}
              className="flex items-start gap-2.5 text-sm text-white/80"
            >
              <Check
                className="mt-1 h-4 w-4 shrink-0 text-violet-soft"
                strokeWidth={2.2}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium leading-snug">{opt.label}</div>
                  <span className="mt-0.5 shrink-0">
                    <MobileInfoTooltip text={opt.detail} label={`About ${opt.label}`} />
                  </span>
                </div>
                <div className="mt-0.5 hidden text-xs leading-snug text-white/45 md:block">
                  {opt.detail}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {bundle.assets.map((asset) => (
            <li
              key={asset}
              className="flex items-start gap-2.5 text-sm text-white/75"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft"
                strokeWidth={2.2}
              />
              <span>{asset}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA → quote tool (Phase 2) */}
      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
        <Link href={href} className="btn-primary group">
          Scope this
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        <Link href="/contact" className="btn-secondary">
          Or talk to us
        </Link>
        <span className="ml-auto text-xs text-white/40">
          Custom proposal in 24h
        </span>
      </div>
    </motion.div>
  );
}
