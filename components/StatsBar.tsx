import { getGoogleRating } from '@/lib/googleRating';
import { StatsBarClient } from './StatsBarClient';

/* ───────────────────────────────────────────────────────────────────────
   StatsBar — server wrapper, position #3 (right under VideoHero)
   ───────────────────────────────────────────────────────────────────────
   Async Server Component so the live Google rating fetch (24h ISR cache,
   server-only env vars) happens at request time during revalidation,
   never on the client.

   Three credentials cells rendered by StatsBarClient:
     1. Google Rating  — dynamic, fetched here
     2. Projects Delivered — 300+
     3. Clients Served     — 120+

   ── Why this lives at #3 now (formerly #4) ──────────────────────────
   Phase 6 originally shipped GoogleRatingBand as its own slim strip at
   position #2. Studio direction said: merge into StatsBar instead — one
   strong "credentials line" beats two stacked moments. StatsBar moved
   up one slot to claim the position immediately below the hero.
   ─────────────────────────────────────────────────────────────────────── */

export async function StatsBar() {
  const { rating, mapsUrl } = await getGoogleRating();
  return <StatsBarClient rating={rating} mapsUrl={mapsUrl} />;
}
