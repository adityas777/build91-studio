# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Portability note: this is the canonical agent-onboarding document. `AGENTS.md`
> and `.github/copilot-instructions.md` are thin mirrors that point here — keep
> the substance in this file. Repo-specific workflows live as skills under
> `.claude/skills/`.

## What this is

Marketing website for **Build91 Studio**, a real-estate visualization & digital-sales
agency (3D renders, virtual tours, drone/aerial, project microsites; India / UAE /
Australia). It is a **Next.js 14 App Router** app in **TypeScript**, styled with
**Tailwind CSS**, animated with **Framer Motion**, and deployed on **Vercel**.

The site is content-heavy and largely **data-driven from typed constants in `lib/`** —
most "content edits" are edits to those files, not to JSX.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build (also the primary type/compile check)
npm run start    # serve the production build
npm run lint     # next lint (eslint-config-next)
node scripts/clean-client-logos.mjs   # one-off: optimize client logo PNGs
```

- **There is no automated test suite** (no jest/vitest/playwright, no `test` script).
  The verification loop is: `npm run lint` + `npm run build` + driving the affected
  flow in a real browser. Do not invent test commands.
- **A dev server is usually already running on `:3000`.** Reuse it. Starting a second
  `next dev` against the same `.next` cache corrupts it and causes spurious 404s. If
  you must run one and the port is taken, assume the running one is fine.

## Big-picture architecture

### Live integrations share one resilient pattern
Three features pull live third-party data, and all follow the **same shape** — learn it
once and you understand all three:

1. A **server-only fetcher in `lib/`** (`import 'server-only'`) that reads secrets from
   `process.env`, wraps `fetch` in Next.js **ISR** (`next: { revalidate }`) plus an
   `AbortController` timeout, and **never throws** — every failure path returns a
   hardcoded fallback with a `source: 'live' | 'fallback'` flag.
2. Callers render **unconditionally** on the result, so a missing key / dead API / bad
   token silently degrades instead of breaking the page.

| Feature | Fetcher | Cache | Fallback | Env gate |
|---|---|---|---|---|
| Google rating (in StatsBar) | `lib/googleRating.ts` | 24h | `FALLBACK_RATING` | `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` |
| Instagram reels ("Selected Work") | `lib/instagram.ts` | 4h | `lib/instagram-fallback.ts` | `IG_BUSINESS_ACCOUNT_ID`, `IG_ACCESS_TOKEN` (or Vercel KV) |

See `.claude/skills/instagram-reels/` for how the IG feed, token rotation, and fallback fit together.

### Server-fetch / client-interactivity split
Sections that need both server data and client state are split into a pair: an **async
Server Component** that awaits the fetcher and a **`"use client"` `*Client`** component
that owns `useState`/effects. Examples: `SelectedWork` → `SelectedWorkClient`, and
`StatsBar` → `StatsBarClient`. Follow this pattern for any new API-backed section rather
than making the whole section a client component.

### Content lives in `lib/` as typed data
The homepage and inner pages are composed from typed constants. To change copy, services,
pricing, stats, etc., edit the data file, not the component:
- `lib/constants.ts` — `SITE` (name, contact, socials, offices), nav links, the 5
  `SERVICE_PILLARS`, process steps, values, project types.
- `lib/solutionsBundles.ts` — project types × stages, per-type asset menus, sub-options.
  Shared by both the SolutionsRouter and the Quote wizard.
- `lib/quotePricing.ts` — **single source of truth for all quote pricing** (formula-based
  pricers, scale schemas, GST, validity, version). See `.claude/skills/quote-engine/`.
- `lib/quoteScope.ts` — price-free scope/timeline derivation.
- `lib/outcomes.ts`, `lib/assetReel.ts`, `lib/clients.ts`, `lib/portfolioData.ts` — data
  for the animated OutcomeWidgets, the AssetReel carousel, the logo wall, and the legacy
  portfolio grid respectively.

### Quote engine (multi-file subsystem)
`components/QuoteWizard.tsx` is a single client component driven by a `useReducer` state
machine (Type → Stage → Scale → Assets → Contact). On submit it POSTs to
`app/api/quote/route.ts`, which validates the payload, runs the pricing engine, and emails
the studio via **Resend** (graceful no-op + 200 when `RESEND_API_KEY` is unset). Pricing
is revealed once, on the outcome screen (`components/QuoteScopePreview.tsx`). Full
rationale in `.claude/skills/quote-engine/`.

### Homepage composition
`app/page.tsx` has a header comment documenting the **exact section order** and why
sections were added/removed (Phases 1/2/5/6 of the roadmap). Read it before reordering.
`docs/V2_CONTENT_ROADMAP.md` is the living plan for shipped + not-yet-built work.

### Routes
App Router under `app/`: `/`, `/services`, `/about`, `/contact`, `/quote`, `/privacy`,
`/terms`. `/work` currently redirects to home (case studies deferred). API routes:
`POST /api/quote` and `GET /api/cron/refresh-instagram-token` (Vercel Cron, weekly, guarded
by `CRON_SECRET`; schedule in `vercel.json`).

## Design system

- **Path alias:** `@/*` → repo root (e.g. `@/components/...`, `@/lib/...`).
- **Tailwind tokens** (`tailwind.config.ts`): `ink.*` (near-black backgrounds),
  `violet.{glow,soft,deep}` (primary accent), `gold.{DEFAULT,soft}` (premium accent).
  Fonts: `font-display` = Space Grotesk, `font-body` = Inter, `font-accent` = Cormorant
  Garamond (italic). Dark theme is global (`bg-ink-900 text-white` in `app/layout.tsx`).
- **Reusable CSS utilities** live in `app/globals.css` under `@layer components` — prefer
  these over re-styling from scratch: `.container-page`, `.section-base`, `.section-neutral`,
  `.section-heading`, `.section-eyebrow`, `.text-gradient`, `.text-accent-italic`,
  `.thin-scrollbar`.
- **`prefers-reduced-motion` is honored throughout** the animated sections (count-ups,
  carousels, tickers, maps). Preserve that when touching motion code.

## Conventions & gotchas

- **File-header comment blocks carry the design rationale.** Most `lib/` and animated
  components open with a boxed comment explaining the *why* (failure modes, cost shape,
  UX decisions). Read them before changing behavior, and match the style when adding code.
- **IG/remote media uses plain `<img>`/`<video>`, not `next/image`,** so no domain
  allowlist is needed for the Instagram CDN. `next.config.js` `images.remotePatterns` only
  covers YouTube/Vimeo thumbnails. Don't route Instagram media through `next/image`.
- **Retained-but-unused components are deliberate rollback targets, not dead code:**
  `BentoPortfolio.tsx` (rollback for the IG feed), `ServicesShowcase.tsx`,
  `ProcessTimeline.tsx`. Don't delete them without checking `app/page.tsx`'s notes.
- **Secrets never use the `NEXT_PUBLIC_` prefix** — the server-only fetchers rely on that
  to keep keys out of the client bundle.

## Environment

Copy `.env.example` → `.env.local` and fill in values. `.env.example` documents every
variable with a full setup checklist (Resend, Google Places API (New), Instagram Graph API
via `graph.instagram.com`, Vercel KV, `CRON_SECRET`). Every integration degrades to a
fallback when its keys are absent, so the app runs with an empty `.env.local`.

### Known latent issues (as of this writing)
- **Instagram fallback assets are missing:** `lib/instagram-fallback.ts` references
  `/public/reels-fallback/*.jpg` and `/public/video/reels-fallback/*.mp4`, but neither
  folder exists. If the live IG fetch ever fails, "Selected Work" renders blank cards
  instead of the intended fallback. Add the assets (or repoint the fallback).
- **IG token auto-rotation needs Vercel KV:** the weekly cron writes the refreshed token to
  KV; without `KV_REST_API_URL`/`KV_REST_API_TOKEN` the 60-day token must be rotated by hand
  before it expires.

## Deployment
Vercel. `vercel.json` declares the token-refresh cron. Set all env vars in the Vercel
project (Preview + Production); connecting a Vercel KV store auto-injects the KV vars.
