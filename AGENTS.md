# AGENTS.md

Cross-agent onboarding for the **Build91 Studio** website. This is the tool-neutral entry
point (read by Codex, Cursor, Zed, Aider, and other agents that look for `AGENTS.md`).

**The full guide is [`CLAUDE.md`](./CLAUDE.md) — read it first.** It is the single source
of truth; this file is a short mirror so agents that only read `AGENTS.md` still have the
essentials.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · deployed on Vercel.
Real-estate visualization agency marketing site. Path alias `@/*` → repo root.

## Commands
```bash
npm run dev      # dev server on :3000
npm run build    # production build = the primary type/compile check
npm run start    # serve the build
npm run lint     # next lint
```
- **No automated test suite exists.** Verify with `npm run lint`, `npm run build`, and by
  driving the affected flow in a real browser. Don't invent test commands.
- **A dev server is usually already running on `:3000` — reuse it.** A second `next dev`
  against the same `.next` cache corrupts it and causes spurious 404s.

## The five things to know before editing
1. **Content is data, not JSX.** Copy, services, pricing, and stats live as typed constants
   in `lib/` (`constants.ts`, `solutionsBundles.ts`, `quotePricing.ts`, `outcomes.ts`, …).
   Edit the data file, not the component.
2. **Live integrations (Google rating, Instagram reels) share one pattern:** a
   `server-only` fetcher in `lib/` with ISR caching + timeout that **never throws** and
   returns a hardcoded fallback when its env vars/API are missing. Callers render
   unconditionally. Keep that resilience.
3. **Server-fetch + client-interactivity are split** into an async Server Component and a
   `"use client"` `*Client` component (e.g. `SelectedWork`/`SelectedWorkClient`). Follow it.
4. **Design system:** Tailwind tokens `ink`/`violet`/`gold`; reuse the `@layer components`
   utilities in `app/globals.css` (`.container-page`, `.section-base`, `.section-heading`,
   `.text-gradient`, …); honor `prefers-reduced-motion` in animated code.
5. **Secrets never use `NEXT_PUBLIC_`.** Copy `.env.example` → `.env.local`; every
   integration degrades gracefully without keys.

## Watch out for
- Instagram/remote media uses plain `<img>`/`<video>`, not `next/image` (no CDN allowlist).
- `BentoPortfolio.tsx`, `ServicesShowcase.tsx`, `ProcessTimeline.tsx` are intentional
  rollback targets, not dead code.
- Known latent issues (missing IG fallback assets; IG token rotation needs Vercel KV) are
  documented in `CLAUDE.md` → "Known latent issues".

For architecture depth, the quote engine, and the Instagram integration, see `CLAUDE.md`
and the workflow guides in `.claude/skills/`.
