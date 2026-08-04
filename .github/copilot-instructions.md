# GitHub Copilot instructions — Build91 Studio

Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion marketing site, deployed on
Vercel. The full guide is [`CLAUDE.md`](../CLAUDE.md); this is a short mirror.

## Conventions to follow
- **Content is data, not JSX.** Copy, services, pricing, and stats are typed constants in
  `lib/` (`constants.ts`, `solutionsBundles.ts`, `quotePricing.ts`, `outcomes.ts`, …). Edit
  the data file, not the component. Import via the `@/*` alias (repo root).
- **Live data uses a resilient pattern:** a `server-only` fetcher in `lib/` (Google rating,
  Instagram reels) with ISR caching + `AbortController` timeout that **never throws** and
  returns a hardcoded fallback when keys/API are unavailable. Callers render unconditionally.
- **Split server data from client state:** an async Server Component that awaits the fetcher
  plus a `"use client"` `*Client` component for interactivity (e.g.
  `SelectedWork`/`SelectedWorkClient`).
- **Styling:** Tailwind tokens `ink` / `violet` / `gold`; reuse the `@layer components`
  utilities in `app/globals.css` (`.container-page`, `.section-base`, `.section-heading`,
  `.text-gradient`, …). Honor `prefers-reduced-motion` in animated code.
- **Secrets never use the `NEXT_PUBLIC_` prefix.**
- Instagram/remote media uses plain `<img>`/`<video>`, not `next/image`.

## Commands
`npm run dev` (:3000, often already running — reuse it), `npm run build` (primary type
check), `npm run lint`. **No test suite exists** — verify via build + browser.

Do not delete `BentoPortfolio.tsx`, `ServicesShowcase.tsx`, or `ProcessTimeline.tsx`; they
are intentional rollback targets.
