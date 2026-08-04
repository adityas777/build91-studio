import { getReels } from '@/lib/instagram';
import { SelectedWorkClient } from './SelectedWorkClient';

/* ───────────────────────────────────────────────────────────────────────
   SelectedWork — async Server Component that pulls IG reels at render
   ───────────────────────────────────────────────────────────────────────
   Replaces the earlier <BentoPortfolio /> which sourced from local MP4s
   in PORTFOLIO_ITEMS. Same heading ("Selected Work / A glimpse of work
   in the wild.") so the section's identity in the page rhythm is
   preserved.

   Why split into Server + Client?
     • Server can call getReels() — server-only, uses IG token from KV
       or env, never bundles secrets into the browser
     • Client owns the lightbox open/close state and click navigation,
       which require useState
   Same pattern we use for StatsBar (rating fetch on the server) and
   for any future API-backed sections.
   ─────────────────────────────────────────────────────────────────────── */

export async function SelectedWork() {
  const { reels } = await getReels();
  return <SelectedWorkClient reels={reels} />;
}
