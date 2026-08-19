'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { MobileInfoTooltip } from '@/components/MobileInfoTooltip';
import {
  OTHER_PROJECT_TYPE,
  PROJECT_TYPES,
  PROJECT_TYPE_ORDER,
  STAGES,
  STAGE_ORDER,
  projectTypeFromParam,
  stageFromParam,
  type AssetOption,
  type AssetSubOption,
  type ProjectTypeId,
  type StageId,
  type WizardProjectTypeId,
} from '@/lib/solutionsBundles';
import {
  LOCATION_INTEL_ASSET_IDS,
  SCALE_FIELDS_BY_TYPE,
  defaultScaleInputsFor,
  isScaleComplete,
  locationAssetIdFor,
  requiresDroneShoot,
  threeDSetIdFor,
  type ScaleField,
  type ScaleInputs,
} from '@/lib/quotePricing';
import { QuoteScopePreview } from '@/components/QuoteScopePreview';

/* ── Sub-option cascade map ───────────────────────────────────────────
   When an asset is toggled, certain sub-options inside Showcase Video
   must be cascaded (auto-cleared on parent off, auto-restored on parent
   on). This config drives that — extending to a new dependency is a
   one-line edit. */
type CascadeRule = {
  /** Does the asset id match the dependency? */
  matches: (assetId: string, type: ProjectTypeId) => boolean;
  /** Owner of the dependent sub-option (e.g. 'showcase-video'). */
  hostAssetId: string;
  /** Sub-option id that follows the dependency's selected state. */
  subOptionId: string;
};

const CASCADE_RULES: CascadeRule[] = [
  {
    matches: (id, type) => threeDSetIdFor(type) === id,
    hostAssetId: 'showcase-video',
    subOptionId: '3d-walkthrough',
  },
  {
    matches: (id) => LOCATION_INTEL_ASSET_IDS.has(id),
    hostAssetId: 'showcase-video',
    subOptionId: 'location-highlights',
  },
];

/* ───────────────────────────────────────────────────────────────────────
   QuoteWizard
   ───────────────────────────────────────────────────────────────────────
   5-step single-page wizard. State machine via useReducer. Pre-fills
   from URL params handed off by SolutionsRouter chip CTAs.

   UX rules (per Phase-2 plan):
     • Chips over dropdowns (every option visible)
     • Step 3 asset list is pre-checked — user *deselects* what's not
       wanted (higher-trust pattern than starting empty)
     • No pricing anywhere — outcome screen is a "scope preview"
     • Progress dots at top, not a stepper bar (lighter feel)
     • Back button preserves all state
     • First 4 steps commitment-free; contact ask is step 5
   ─────────────────────────────────────────────────────────────────────── */

// STEP ORDER: Scale comes BEFORE Assets so live pricing can be computed
// the moment the user enters the assets step (assets are pre-checked).
//
// 'other' SHORT-CIRCUIT: picking the "Other" project type skips Stage,
// Scale and Assets entirely (no auto-quote possible) — the wizard jumps
// straight from step 0 to the contact step, and Back returns to step 0.
const STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'stage', label: 'Stage' },
  { id: 'scale', label: 'Scale' },
  { id: 'assets', label: 'Assets' },
  { id: 'contact', label: 'You' },
] as const;

type StepIndex = 0 | 1 | 2 | 3 | 4;

/** Narrow the wizard's type (which may be the 'other' catch-all) down to
 *  a real bundle id that PROJECT_TYPES / pricing helpers accept. */
function isStandardType(t: WizardProjectTypeId | null): t is ProjectTypeId {
  return t !== null && t !== 'other';
}

type ContactState = {
  // Optional project metadata — collected up-top in step 5 but not gated.
  projectName: string;
  /** Address text OR a Google Maps URL — single freeform field. */
  location: string;
  /** Drive/Dropbox/etc. link to CAD files — text URL, not file upload (v1). */
  cadUrl: string;
  // Required contact fields — these gate submit.
  name: string;
  role: string;
  company: string;
  phone: string;
  email: string;
};

type WizardState = {
  step: StepIndex;
  type: WizardProjectTypeId | null;
  stage: StageId | null;
  selectedAssetIds: string[];
  /** Type-specific scale numeric inputs (towers, plots, etc.). */
  scaleInputs: ScaleInputs;
  /** Per-asset sub-option selections (multi-select within an asset). */
  subOptionsByAsset: Record<string, string[]>;
  contact: ContactState;
  submitting: boolean;
  result: 'idle' | 'success' | 'error';
  errorMessage: string | null;
};

type Action =
  | { kind: 'set-type'; type: WizardProjectTypeId }
  | { kind: 'set-stage'; stage: StageId }
  | { kind: 'toggle-asset'; assetId: string; asset: AssetOption }
  | { kind: 'set-scale-field'; key: string; value: number }
  | { kind: 'toggle-sub-option'; assetId: string; subId: string }
  | { kind: 'set-contact'; patch: Partial<ContactState> }
  | { kind: 'next' }
  | { kind: 'prev' }
  | { kind: 'submit-start' }
  | { kind: 'submit-success' }
  | { kind: 'submit-error'; message: string };

type PrefillInput = {
  type?: string | null;
  stage?: string | null;
};

/** Build the default sub-option map for the assets that are pre-selected
 *  when a type is chosen. Each asset that has sub-options gets ALL of
 *  them auto-selected (matches the "pre-checked" pattern). */
function defaultSubOptionsFor(type: ProjectTypeId): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const opt of PROJECT_TYPES[type].assetOptions) {
    if (opt.subOptions && opt.subOptions.length > 0) {
      map[opt.id] = opt.subOptions.map((s) => s.id);
    }
  }
  return map;
}

/** Compute the initial wizard state, baking URL-param pre-fill straight
 *  in. Doing this at useReducer-init time (rather than via useEffect)
 *  removes any chance of mid-render dispatch ordering bugs and keeps
 *  step computation atomic. */
function initialState(prefill?: PrefillInput): WizardState {
  const rawType = prefill?.type ?? null;
  const type: WizardProjectTypeId | null =
    rawType === OTHER_PROJECT_TYPE.quoteParam
      ? 'other'
      : projectTypeFromParam(rawType);
  const stage = stageFromParam(prefill?.stage ?? null);

  // Step computation rule:
  //   • type = 'other'            → land on Contact (step 4) — the
  //                                 lifecycle/scale/asset steps are skipped
  //   • type AND stage pre-filled → land on Scale (step 2)
  //   • type only                 → land on Stage (step 1)
  //   • stage only or neither     → land on Type  (step 0)
  let step: StepIndex = 0;
  if (type === 'other') step = 4;
  else if (type && stage) step = 2;
  else if (type) step = 1;

  return {
    step,
    type,
    stage,
    selectedAssetIds: isStandardType(type)
      ? PROJECT_TYPES[type].assetOptions.map((o) => o.id)
      : [],
    scaleInputs: isStandardType(type) ? defaultScaleInputsFor(type) : {},
    subOptionsByAsset: isStandardType(type) ? defaultSubOptionsFor(type) : {},
    contact: {
      projectName: '',
      location: '',
      cadUrl: '',
      name: '',
      role: '',
      company: '',
      phone: '',
      email: '',
    },
    submitting: false,
    result: 'idle',
    errorMessage: null,
  };
}

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.kind) {
    case 'set-type': {
      // 'other' carries no asset bundle — clear the dependent selections
      // so a stale kit from a previously explored type can't leak into
      // the custom-requirement submission.
      if (action.type === 'other') {
        return {
          ...state,
          type: 'other',
          selectedAssetIds: [],
          scaleInputs: {},
          subOptionsByAsset: {},
        };
      }
      // Changing type resets EVERYTHING that depends on it.
      const allIds = PROJECT_TYPES[action.type].assetOptions.map((o) => o.id);
      return {
        ...state,
        type: action.type,
        selectedAssetIds: allIds,
        scaleInputs: defaultScaleInputsFor(action.type),
        subOptionsByAsset: defaultSubOptionsFor(action.type),
      };
    }
    case 'set-stage':
      return { ...state, stage: action.stage };
    case 'toggle-asset': {
      const has = state.selectedAssetIds.includes(action.assetId);
      const nextIds = has
        ? state.selectedAssetIds.filter((id) => id !== action.assetId)
        : [...state.selectedAssetIds, action.assetId];
      // Own sub-options: clear when off, pre-fill all when on.
      const nextSubs = { ...state.subOptionsByAsset };
      if (has) {
        delete nextSubs[action.assetId];
      } else if (action.asset.subOptions && action.asset.subOptions.length > 0) {
        nextSubs[action.assetId] = action.asset.subOptions.map((s) => s.id);
      }
      // Cascade: when this asset toggle affects another asset's sub-option
      // (e.g. 3D Set off → Showcase Video's "3D walkthrough" off), apply.
      if (isStandardType(state.type)) {
        for (const rule of CASCADE_RULES) {
          if (!rule.matches(action.assetId, state.type)) continue;
          const hostSubs = nextSubs[rule.hostAssetId];
          if (!hostSubs) continue;
          if (has) {
            // Parent turning OFF → remove dependent sub-option.
            nextSubs[rule.hostAssetId] = hostSubs.filter(
              (id) => id !== rule.subOptionId,
            );
          } else if (
            nextIds.includes(rule.hostAssetId) &&
            !hostSubs.includes(rule.subOptionId)
          ) {
            // Parent turning ON (and host is selected) → restore.
            nextSubs[rule.hostAssetId] = [...hostSubs, rule.subOptionId];
          }
        }
      }
      return {
        ...state,
        selectedAssetIds: nextIds,
        subOptionsByAsset: nextSubs,
      };
    }
    case 'set-scale-field':
      return {
        ...state,
        scaleInputs: { ...state.scaleInputs, [action.key]: action.value },
      };
    case 'toggle-sub-option': {
      const current = state.subOptionsByAsset[action.assetId] ?? [];
      const has = current.includes(action.subId);
      const next = has
        ? current.filter((id) => id !== action.subId)
        : [...current, action.subId];
      return {
        ...state,
        subOptionsByAsset: {
          ...state.subOptionsByAsset,
          [action.assetId]: next,
        },
      };
    }
    case 'set-contact':
      return { ...state, contact: { ...state.contact, ...action.patch } };
    case 'next':
      // 'other' flow: Type jumps straight to Contact.
      if (state.type === 'other' && state.step === 0) {
        return { ...state, step: 4 };
      }
      return { ...state, step: Math.min(4, state.step + 1) as StepIndex };
    case 'prev':
      // 'other' flow: Back from Contact returns to Type.
      if (state.type === 'other' && state.step === 4) {
        return { ...state, step: 0 };
      }
      return { ...state, step: Math.max(0, state.step - 1) as StepIndex };
    case 'submit-start':
      return { ...state, submitting: true, errorMessage: null };
    case 'submit-success':
      return { ...state, submitting: false, result: 'success' };
    case 'submit-error':
      return {
        ...state,
        submitting: false,
        result: 'error',
        errorMessage: action.message,
      };
  }
}

type Props = {
  /** Pre-fill values from URL query (type=, stage=). */
  prefill?: {
    type?: string | null;
    stage?: string | null;
  };
};

export function QuoteWizard({ prefill }: Props) {
  // Pre-fill is computed once at init time — no useEffect/dispatch dance.
  const [state, dispatch] = useReducer(reducer, prefill, initialState);
  const topRef = useRef<HTMLDivElement>(null);
  const skipFirstScroll = useRef(true);

  // Scroll wizard to top on every step change (skips first render so the
  // page doesn't jump immediately on mount).
  useEffect(() => {
    if (skipFirstScroll.current) {
      skipFirstScroll.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.step]);

  // ── Auto-advance for single-select steps ────────────────────────────
  // Steps 0 (Type), 1 (Stage), 3 (Scale) are single-choice — picking is
  // the only action that step needs, so we advance automatically after
  // a brief delay (so the user sees their selection highlight before the
  // transition). The timeout is debounced via a ref: rapid re-taps reset
  // the timer so we never double-skip.
  const advanceTimer = useRef<number | null>(null);
  useEffect(() => {
    // Clear any pending timer if the component unmounts.
    return () => {
      if (advanceTimer.current !== null) {
        window.clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  function scheduleAutoAdvance() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    advanceTimer.current = window.setTimeout(() => {
      dispatch({ kind: 'next' });
      advanceTimer.current = null;
    }, 220);
  }

  // ── Step gating ─────────────────────────────────────────────────────
  // For step 4, compute a *list* of what's missing so we can show the
  // user under the disabled submit button — much better UX than a
  // mute disabled state.
  // Does the user's asset selection trigger the drone-shoot addendum?
  // If yes, the project Location field becomes required on step 4.
  const droneRequired = requiresDroneShoot(state.selectedAssetIds);

  const missingStep4 = useMemo(() => {
    const c = state.contact;
    const missing: string[] = [];
    if (c.name.trim().length < 2) missing.push('Name');
    if (!/\S+@\S+\.\S+/.test(c.email)) missing.push('Email');
    if (c.phone.trim().length < 7) missing.push('Phone');
    if (c.company.trim().length < 1) missing.push('Company');
    if (droneRequired && c.location.trim().length < 5) {
      missing.push('Project location (for drone quote)');
    }
    return missing;
  }, [state.contact, droneRequired]);

  // Step order (per `STEPS` array):
  //   0 type · 1 stage · 2 scale · 3 assets · 4 contact
  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 0:
        return state.type !== null;
      case 1:
        return state.stage !== null;
      case 2:
        return (
          isStandardType(state.type) &&
          isScaleComplete(state.type, state.scaleInputs)
        );
      case 3: {
        if (state.selectedAssetIds.length === 0) return false;
        // Every selected asset with sub-options needs ≥ 1 sub-option selected.
        if (!isStandardType(state.type)) return false;
        for (const id of state.selectedAssetIds) {
          const asset = PROJECT_TYPES[state.type].assetOptions.find((a) => a.id === id);
          if (asset?.subOptions && asset.subOptions.length > 0) {
            const subs = state.subOptionsByAsset[id] ?? [];
            if (subs.length === 0) return false;
          }
        }
        return true;
      }
      case 4:
        return missingStep4.length === 0;
    }
  }, [state, missingStep4]);

  // ── Submit ──────────────────────────────────────────────────────────
  async function submit() {
    if (!state.type) return;
    // 'other' submits contact-only — no stage/scale/assets to validate.
    if (state.type !== 'other') {
      if (!state.stage) return;
      if (!isScaleComplete(state.type, state.scaleInputs)) return;
    }

    dispatch({ kind: 'submit-start' });
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: state.type,
          // A stage explored before switching to 'other' is not part of
          // the custom requirement — don't send it.
          stage: state.type === 'other' ? null : state.stage,
          assetIds: state.selectedAssetIds,
          scaleInputs: state.scaleInputs,
          subOptionsByAsset: state.subOptionsByAsset,
          contact: state.contact,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dispatch({ kind: 'submit-success' });
    } catch (err) {
      dispatch({
        kind: 'submit-error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // ── Outcome screen ──────────────────────────────────────────────────
  // 'other' → review mode: no quote figure, "under review" notice, and the
  // proposal line cites BOTH email and phone (we may call for details).
  if (state.result === 'success' && state.type === 'other') {
    return (
      <QuoteScopePreview
        firstName={state.contact.name.split(' ')[0]}
        email={state.contact.email}
        phone={state.contact.phone}
        projectTypeLabel="custom"
        mode="review"
        quote={null}
      />
    );
  }
  if (state.result === 'success' && isStandardType(state.type)) {
    return (
      <QuoteScopePreview
        firstName={state.contact.name.split(' ')[0]}
        email={state.contact.email}
        projectTypeLabel={PROJECT_TYPES[state.type].label}
        quote={
          state.stage
            ? {
                typeId: state.type,
                stage: state.stage,
                scaleInputs: state.scaleInputs,
                selectedAssetIds: state.selectedAssetIds,
                subOptionsByAsset: state.subOptionsByAsset,
              }
            : null
        }
      />
    );
  }

  const isOtherFlow = state.type === 'other';

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-28">
      {/* Progress dots — collapse to Type · You in the 'other' flow */}
      <ProgressDots current={state.step} otherFlow={isOtherFlow} />

      {/* Step content */}
      <div className="relative mt-10 min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {state.step === 0 && (
              <StepType
                selected={state.type}
                onSelect={(t) => {
                  dispatch({ kind: 'set-type', type: t });
                  scheduleAutoAdvance();
                }}
              />
            )}
            {state.step === 1 && (
              <StepStage
                selected={state.stage}
                onSelect={(s) => {
                  dispatch({ kind: 'set-stage', stage: s });
                  scheduleAutoAdvance();
                }}
              />
            )}
            {state.step === 2 && isStandardType(state.type) && (
              <StepScale
                type={state.type}
                inputs={state.scaleInputs}
                onChange={(key, value) =>
                  dispatch({ kind: 'set-scale-field', key, value })
                }
              />
            )}
            {state.step === 3 && isStandardType(state.type) && (
              <StepAssets
                type={state.type}
                selectedIds={state.selectedAssetIds}
                subOptionsByAsset={state.subOptionsByAsset}
                onToggle={(asset) =>
                  dispatch({ kind: 'toggle-asset', assetId: asset.id, asset })
                }
                onToggleSubOption={(assetId, subId) =>
                  dispatch({ kind: 'toggle-sub-option', assetId, subId })
                }
              />
            )}
            {state.step === 4 && (
              <StepContact
                contact={state.contact}
                onPatch={(patch) => dispatch({ kind: 'set-contact', patch })}
                errorMessage={state.errorMessage}
                droneRequired={droneRequired}
                isOther={isOtherFlow}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Inline nav footer — used on every step. Pricing has been moved
          out of the wizard entirely; the quote is revealed only on the
          outcome screen after contact submission. */}
      <div className="mt-10 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => dispatch({ kind: 'prev' })}
            disabled={state.step === 0 || state.submitting}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/55 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {state.step < 4 ? (
            <button
              type="button"
              onClick={() => dispatch({ kind: 'next' })}
              disabled={!canAdvance}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canAdvance || state.submitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  {/* 'other' shows no quote figure — don't promise one. */}
                  {isOtherFlow ? 'Send my requirement' : 'Get my quote'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Helper line — surfaces what's still missing on step 4 so the
            disabled button is never a silent dead-end. */}
        {state.step === 4 && missingStep4.length > 0 && !state.submitting && (
          <div className="mt-3 text-right text-xs text-white/45">
            Still needed:{' '}
            <span className="text-white/75">{missingStep4.join(' · ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Progress dots ──────────────────────────────────────────────────────── */

function ProgressDots({
  current,
  otherFlow,
}: {
  current: StepIndex;
  otherFlow: boolean;
}) {
  // 'other' flow only has two stops: Type and You.
  const steps = otherFlow ? [STEPS[0], STEPS[4]] : [...STEPS];
  const activeIndex = otherFlow ? (current === 0 ? 0 : 1) : current;
  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((s, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 transition-all ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <span
                aria-hidden
                className={`relative inline-flex h-2.5 w-2.5 items-center justify-center rounded-full transition-all ${
                  isActive
                    ? 'bg-violet-glow shadow-[0_0_12px_3px_rgba(124,58,237,0.55)]'
                    : isDone
                      ? 'bg-gold'
                      : 'bg-white/20'
                }`}
              />
              {isActive && (
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/80">
                  {s.label}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={`h-px w-6 transition-colors ${
                  isDone ? 'bg-gold/40' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 0 — Project Type ─────────────────────────────────────────────── */

function StepType({
  selected,
  onSelect,
}: {
  selected: WizardProjectTypeId | null;
  onSelect: (id: WizardProjectTypeId) => void;
}) {
  return (
    <div>
      <StepHeading
        title="What are you launching?"
        sub="Pick the project type closest to yours. You can refine later."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PROJECT_TYPE_ORDER.map((id) => {
          const b = PROJECT_TYPES[id];
          return (
            <SelectableCard
              key={id}
              icon={b.icon}
              title={b.label}
              sub={b.blurb}
              active={selected === id}
              onClick={() => onSelect(id)}
            />
          );
        })}
        {/* Catch-all — skips Stage/Scale/Assets, goes straight to contact.
            Full-width so it reads as the deliberate "none of the above". */}
        <div className="sm:col-span-2">
          <SelectableCard
            icon={OTHER_PROJECT_TYPE.icon}
            title={OTHER_PROJECT_TYPE.label}
            sub={OTHER_PROJECT_TYPE.blurb}
            active={selected === 'other'}
            onClick={() => onSelect('other')}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 — Stage ────────────────────────────────────────────────────── */

function StepStage({
  selected,
  onSelect,
}: {
  selected: StageId | null;
  onSelect: (id: StageId) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Where are you in the lifecycle?"
        sub="Stage determines how aggressive — or how patient — the production calendar gets."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {STAGE_ORDER.map((id) => {
          const b = STAGES[id];
          return (
            <SelectableCard
              key={id}
              icon={b.icon}
              title={b.label}
              sub={b.blurb}
              active={selected === id}
              onClick={() => onSelect(id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3 — Asset selection (with sub-options) ───────────────────────── */

function StepAssets({
  type,
  selectedIds,
  subOptionsByAsset,
  onToggle,
  onToggleSubOption,
}: {
  type: ProjectTypeId;
  selectedIds: string[];
  subOptionsByAsset: Record<string, string[]>;
  onToggle: (asset: AssetOption) => void;
  onToggleSubOption: (assetId: string, subId: string) => void;
}) {
  const options = PROJECT_TYPES[type].assetOptions;

  /* Sub-options that should be DISABLED because their dependency asset
   * isn't selected. Drives the grayed-out + un-tappable state in the UI.
   * Mirrors the cascade rules in the reducer — when 3D Set is off,
   * "3D walkthrough" should look + behave inactive. */
  const disabledSubByAsset = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    if (selectedIds.includes('showcase-video')) {
      const showcaseDisabled = new Set<string>();
      const threeDId = threeDSetIdFor(type);
      if (threeDId && !selectedIds.includes(threeDId)) {
        showcaseDisabled.add('3d-walkthrough');
      }
      const locId = locationAssetIdFor(type);
      if (locId && !selectedIds.includes(locId)) {
        showcaseDisabled.add('location-highlights');
      }
      if (showcaseDisabled.size > 0) {
        map['showcase-video'] = showcaseDisabled;
      }
    }
    return map;
  }, [type, selectedIds]);

  return (
    <div>
      <StepHeading
        title="Which assets do you need?"
        sub={`We've pre-selected the full ${PROJECT_TYPES[type].label.toLowerCase()} kit — uncheck anything you don't want. Some assets have variants — pick at least one.`}
      />
      <div className="mt-8 grid gap-3">
        {options.map((opt) => (
          <AssetCard
            key={opt.id}
            option={opt}
            isOn={selectedIds.includes(opt.id)}
            subOptionIds={subOptionsByAsset[opt.id] ?? []}
            disabledSubOptionIds={disabledSubByAsset[opt.id] ?? EMPTY_SET}
            onToggle={() => onToggle(opt)}
            onToggleSubOption={(subId) => onToggleSubOption(opt.id, subId)}
          />
        ))}
      </div>
    </div>
  );
}

/** Shared empty set to keep AssetCard prop identity stable. */
const EMPTY_SET: ReadonlySet<string> = new Set();

function AssetCard({
  option,
  isOn,
  subOptionIds,
  disabledSubOptionIds,
  onToggle,
  onToggleSubOption,
}: {
  option: AssetOption;
  isOn: boolean;
  subOptionIds: string[];
  disabledSubOptionIds: ReadonlySet<string>;
  onToggle: () => void;
  onToggleSubOption: (subId: string) => void;
}) {
  const Icon = option.icon;
  const hasSubOptions = !!option.subOptions && option.subOptions.length > 0;
  const subMissing =
    isOn && hasSubOptions && subOptionIds.length === 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        isOn
          ? 'border-violet-glow/60 bg-violet-glow/[0.08] shadow-[0_10px_30px_-12px_rgba(124,58,237,0.5)]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
      } ${subMissing ? 'border-red-400/50' : ''}`}
    >
      {/* div+role, not <button>: MobileInfoTooltip renders its own <button>,
          and nested buttons are invalid HTML (breaks hydration on /quote). */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-pressed={isOn}
        className="group flex flex-row-reverse w-full cursor-pointer select-none items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-white/[0.02] md:p-5"
      >
        <div
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            isOn
              ? 'border-violet-glow/40 bg-violet-glow/[0.12] text-violet-soft'
              : 'border-white/10 bg-white/[0.04] text-white/55'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-semibold leading-snug text-white md:text-base">
              {option.label}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <MobileInfoTooltip text={option.detail} label={`About ${option.label}`} />
              <Checkmark on={isOn} />
            </div>
          </div>
          <div className="mt-1 hidden text-sm leading-relaxed text-white/55 md:block">
            {option.detail}
          </div>
        </div>
      </div>

      {/* Sub-options panel — only rendered when the asset is selected
          AND has sub-options to choose from. */}
      {isOn && hasSubOptions && option.subOptions && (
        <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 md:px-5 md:py-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
              Pick variants
            </span>
            {subMissing && (
              <span className="text-[10px] uppercase tracking-[0.18em] text-red-300">
                At least one required
              </span>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {option.subOptions.map((sub) => (
              <SubOptionChip
                key={sub.id}
                sub={sub}
                isOn={subOptionIds.includes(sub.id)}
                disabled={disabledSubOptionIds.has(sub.id)}
                onToggle={() => onToggleSubOption(sub.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubOptionChip({
  sub,
  isOn,
  disabled,
  onToggle,
}: {
  sub: AssetSubOption;
  isOn: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  // Disabled chips: muted styling, no click, native title hint explains why.
  const effectivelyOn = isOn && !disabled;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={effectivelyOn}
      aria-disabled={disabled}
      title={
        disabled
          ? 'Select the required parent asset above to enable this option'
          : undefined
      }
      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-white/[0.06] bg-white/[0.01] text-white/30'
          : effectivelyOn
            ? 'border-violet-glow/50 bg-violet-glow/[0.10] text-white'
            : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/25 hover:text-white'
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          disabled
            ? 'border-white/15 bg-white/[0.02]'
            : effectivelyOn
              ? 'border-violet-glow bg-violet-glow text-white'
              : 'border-white/30 bg-white/[0.04]'
        }`}
      >
        {effectivelyOn && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium leading-snug md:text-sm">
          {sub.label}
          {disabled && (
            <span className="ml-1.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
              · requires parent asset
            </span>
          )}
        </div>
        {sub.detail && (
          <div
            className={`mt-0.5 text-[10px] leading-snug md:text-xs ${
              disabled ? 'text-white/25' : 'text-white/45'
            }`}
          >
            {sub.detail}
          </div>
        )}
      </div>
    </button>
  );
}

function Checkmark({ on }: { on: boolean }) {
  // h-6 w-6 = 24×24 so we align cleanly with the ⓘ tooltip button next to
  // us in the AssetCard's right-side trigger group.
  return (
    <span
      aria-hidden
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
        on
          ? 'border-violet-glow bg-violet-glow text-white'
          : 'border-white/25 bg-white/[0.04]'
      }`}
    >
      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}

/* ── Step 2 — Project Scale (type-aware form) ─────────────────────────── */

function StepScale({
  type,
  inputs,
  onChange,
}: {
  type: ProjectTypeId;
  inputs: ScaleInputs;
  onChange: (key: string, value: number) => void;
}) {
  const fields = SCALE_FIELDS_BY_TYPE[type];
  return (
    <div>
      <StepHeading
        title="How big is the project?"
        sub={`Tell us the shape of the ${PROJECT_TYPES[type].label.toLowerCase()} — drives scope, sequencing and the quote.`}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <ScaleFieldInput
            key={field.key}
            field={field}
            value={inputs[field.key]}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function ScaleFieldInput({
  field,
  value,
  onChange,
}: {
  field: ScaleField;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  if (field.control === 'range') {
    return <RangeSelectField field={field} value={value} onChange={onChange} />;
  }
  return <StepperField field={field} value={value} onChange={onChange} />;
}

function FieldLabel({ field }: { field: ScaleField }) {
  return (
    <span className="flex items-baseline justify-between gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/55">
      <span className="flex items-center gap-1.5">
        {field.label}
        {field.hint && (
          <MobileInfoTooltip text={field.hint} label={`About ${field.label}`} />
        )}
      </span>
      {field.unit && (
        <span className="text-[10px] tracking-[0.2em] text-white/35">
          {field.unit}
        </span>
      )}
    </span>
  );
}

function StepperField({
  field,
  value,
  onChange,
}: {
  field: ScaleField;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const current = value ?? field.default;
  const step = field.step ?? 1;
  const min = field.min ?? 0;
  const max = field.max ?? 9999;
  const atMin = current <= min;
  const atMax = current >= max;

  const adjust = (delta: number) => {
    const raw = current + delta;
    const clamped = Math.max(min, Math.min(max, raw));
    const next = field.decimal
      ? Math.round(clamped * 10) / 10 // 1 decimal precision
      : Math.round(clamped);
    onChange(next);
  };

  // Display: "1" vs "1.5" — only show decimal when needed
  const display =
    field.decimal && current % 1 !== 0
      ? current.toFixed(1)
      : String(Math.round(current));

  return (
    <div className="block">
      <FieldLabel field={field} />
      <div className="mt-2 flex items-stretch gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <StepperButton
          label="Decrease"
          onClick={() => adjust(-step)}
          disabled={atMin}
        >
          −
        </StepperButton>
        <div className="flex flex-1 items-center justify-center text-lg font-semibold tabular-nums text-white">
          {display}
        </div>
        <StepperButton
          label="Increase"
          onClick={() => adjust(step)}
          disabled={atMax}
        >
          +
        </StepperButton>
      </div>
    </div>
  );
}

function StepperButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-xl text-white/85 transition-colors hover:border-violet-glow/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function RangeSelectField({
  field,
  value,
  onChange,
}: {
  field: ScaleField;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const current = value ?? field.default;
  const options = field.options ?? [];
  return (
    <div className="block">
      <FieldLabel field={field} />
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isOn = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={isOn}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all md:text-sm ${
                isOn
                  ? 'border-violet-glow/60 bg-violet-glow/[0.12] text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 4 — Contact + Launch Window ──────────────────────────────────── */

function StepContact({
  contact,
  onPatch,
  errorMessage,
  droneRequired,
  isOther,
}: {
  contact: ContactState;
  onPatch: (patch: Partial<ContactState>) => void;
  errorMessage: string | null;
  droneRequired: boolean;
  isOther: boolean;
}) {
  // Project details (optional, EXCEPT when drone-involved assets were
  // selected — then Location becomes required). Auto-expanded when:
  //   • any field already has content (back-nav case), OR
  //   • drone shoot is required (we need the Maps link).
  const hasProjectInfo =
    contact.projectName.length > 0 ||
    contact.location.length > 0 ||
    contact.cadUrl.length > 0;
  const [projectOpen, setProjectOpen] = useState(
    hasProjectInfo || droneRequired,
  );

  // Keep the section auto-expanded if drone-required flips on after the
  // user lands on this step (e.g. by going back and toggling an asset).
  useEffect(() => {
    if (droneRequired) setProjectOpen(true);
  }, [droneRequired]);

  return (
    <div>
      <StepHeading
        title="One last thing."
        sub={
          isOther
            ? 'Tell us how to reach you — our team reviews your requirement and sends a tailored proposal within 24 hours.'
            : 'Tell us where to send your quote — it appears on the next screen.'
        }
      />

      {/* Confidentiality reassurance — premium, restrained, sets the
          tone for the form below. */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-glow/15 bg-violet-glow/[0.04] p-3.5 md:p-4">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft md:h-5 md:w-5"
          strokeWidth={1.8}
        />
        <p className="text-xs leading-relaxed text-white/65 md:text-sm">
          Everything you share — name, drawings, address — stays confidential.
          Pre-launch assets are NDA-sealed and never leave our studio.
        </p>
      </div>

      {/* Contact form — required fields */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Field
          label="Full name"
          value={contact.name}
          onChange={(v) => onPatch({ name: v })}
          autoComplete="name"
          required
        />
        <Field
          label="Company"
          value={contact.company}
          onChange={(v) => onPatch({ company: v })}
          autoComplete="organization"
          required
        />
        <Field
          label="Phone / WhatsApp"
          value={contact.phone}
          onChange={(v) => onPatch({ phone: v })}
          autoComplete="tel"
          inputMode="tel"
          required
        />
        <Field
          label="Email"
          value={contact.email}
          onChange={(v) => onPatch({ email: v })}
          autoComplete="email"
          type="email"
          required
        />
        <div className="sm:col-span-2">
          <Field
            label="Role"
            value={contact.role}
            onChange={(v) => onPatch({ role: v })}
            placeholder="e.g. Marketing Head"
          />
        </div>
      </div>

      {/* Project details — collapsible. Crisp on mobile, expandable for
          users who want to share extra context up-front. Auto-expanded
          and Location forced-required when drone-involved assets were
          selected (we need a Maps link to quote the drone shoot). */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setProjectOpen((v) => !v)}
          aria-expanded={projectOpen}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.04]"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-white/80">
            <span className="text-white/45">{projectOpen ? '−' : '+'}</span>
            Project details
            <span className="text-xs font-normal text-white/40">
              {droneRequired ? 'required for drone' : 'optional'}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-white/45 transition-transform ${
              projectOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {projectOpen && (
            <motion.div
              key="project-details-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-3 pt-4 sm:grid-cols-2 sm:gap-4">
                <Field
                  label="Project name"
                  value={contact.projectName}
                  onChange={(v) => onPatch({ projectName: v })}
                  placeholder="e.g. Skyline Heights"
                />
                <Field
                  label={
                    droneRequired
                      ? 'Project location — Google Maps link'
                      : 'Location'
                  }
                  value={contact.location}
                  onChange={(v) => onPatch({ location: v })}
                  placeholder={
                    droneRequired
                      ? 'https://maps.app.goo.gl/… so we can quote drone work'
                      : 'Address or Maps link'
                  }
                  required={droneRequired}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Project CAD"
                    value={contact.cadUrl}
                    onChange={(v) => onPatch({ cadUrl: v })}
                    placeholder="Drive / Dropbox / WeTransfer link"
                  />
                </div>
              </div>
              {droneRequired && (
                <div className="mt-3 text-xs text-gold/85">
                  Drone shoot is billed at actuals based on location — your
                  Maps link helps us quote it accurately within 24 hours.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200">
          Couldn&rsquo;t send: {errorMessage}. Try again or write to us
          directly.
        </div>
      )}
    </div>
  );
}

/* ── Generic field ──────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = 'text',
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email';
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-1 text-xs font-medium uppercase tracking-[0.22em] text-white/45">
        {label}
        {required && <span aria-hidden className="text-violet-soft/70">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-glow/50 focus:bg-white/[0.05]"
      />
    </label>
  );
}

/* ── Shared building blocks ────────────────────────────────────────────── */

function StepHeading({ title, sub }: { title: string; sub: string }) {
  // Mobile: title + ⓘ tooltip (popover, doesn't disturb layout).
  // Desktop: sub-text rendered inline under title.
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-display text-2xl font-semibold leading-tight md:text-4xl">
          {title}
        </h2>
        <span className="mt-1.5 shrink-0">
          <MobileInfoTooltip text={sub} label="About this step" />
        </span>
      </div>
      <p className="mt-3 hidden max-w-xl text-base leading-relaxed text-white/60 md:block">
        {sub}
      </p>
    </div>
  );
}

function SelectableCard({
  icon: Icon,
  title,
  sub,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    // div+role, not <button>: MobileInfoTooltip renders its own <button>,
    // and nested buttons are invalid HTML (breaks hydration on /quote).
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={active}
      className={`group flex flex-row-reverse w-full cursor-pointer select-none items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-all md:p-5 ${
        active
          ? 'border-violet-glow/60 bg-violet-glow/[0.08] shadow-[0_10px_30px_-12px_rgba(124,58,237,0.5)]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <div
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          active
            ? 'border-violet-glow/40 bg-violet-glow/[0.12] text-violet-soft'
            : 'border-white/10 bg-white/[0.04] text-white/55'
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        {/* items-start + shrink-0 on the trigger keeps the icon
            top-right regardless of how the title wraps. */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-snug text-white md:text-base">
            {title}
          </div>
          <span className="mt-0.5 shrink-0">
            <MobileInfoTooltip text={sub} label={`About ${title}`} />
          </span>
        </div>
        <div className="mt-1 hidden text-sm leading-relaxed text-white/55 md:block">
          {sub}
        </div>
      </div>
    </div>
  );
}
