import { redirect } from 'next/navigation';

/* ───────────────────────────────────────────────────────────────────────
   /work — REMOVED for now (owner direction, 2026-06-10).

   The standalone Work page showed the static PortfolioGrid, which lagged
   behind the live Instagram feed on the home page. Until case studies
   ship (V2_CONTENT_ROADMAP Phase 3), any direct visit or old shared link
   lands on the home page instead of a 404.

   To restore: replace this redirect with the previous page (git history,
   commit before 2026-06-10) and re-add { href: '/work', label: 'Work' }
   to NAV_LINKS in lib/constants.ts. PortfolioGrid.tsx and
   lib/portfolioData.ts are still on disk, untouched.
   ─────────────────────────────────────────────────────────────────────── */

export default function WorkPage() {
  redirect('/');
}
