/* ───────────────────────────────────────────────────────────────────────
   googleRating — Live Google Places rating with 24h ISR cache + fallback
   ───────────────────────────────────────────────────────────────────────
   Server-only. Calls Places API (New) with a tight field mask so we stay
   in the cheapest billing tier and don't accidentally pull extra fields
   we don't need. Cached for 24h via Next.js's built-in data cache (`next:
   { revalidate }`) so a typical month sees ~30 calls — well inside Google's
   free quota.

   ── Cost shape ──────────────────────────────────────────────────────
     • Places API (New) Place Details, field mask = "rating"
     • Billed at Place Details (Enterprise) SKU rate (~$25/1000 calls)
       because `rating` is in that tier
     • 24h ISR cache → ~30 calls/month → ~$0.75/month worst case
     • Google's $200/month free credit covers this many times over

   ── ToS compliance touchpoints ──────────────────────────────────────
     • Caller (the band component) MUST show Google attribution near the
       number — the official 4-color "G" mark serves this purpose
     • Caller MUST link the band to the Maps listing (handled via the
       returned `mapsUrl`)
     • We MUST NOT persist this rating beyond 30 days — our 24h cache
       trivially satisfies this; nothing is written to disk

   ── Failure modes (all handled, all fall back silently) ─────────────
     • Missing env vars (dev without `.env.local`)            → fallback
     • Network failure / timeout (4s AbortController)         → fallback
     • Non-2xx HTTP response (quota exceeded, bad key, etc.)  → fallback
     • Valid response but missing `rating` field              → fallback
   `source: 'fallback'` lets the caller render the same UI either way —
   the band never shows "Loading…" or "—" or an empty state.
   ─────────────────────────────────────────────────────────────────────── */

import 'server-only';

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';
const REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours
const FETCH_TIMEOUT_MS = 4000;

// CONFIRM: keep in sync with the live rating; this is the value shown if
// the API call fails before any successful fetch has populated the cache.
// Drift between this and the live rating is invisible to users (live wins
// once the cache populates) — this is purely a first-paint safety net.
const FALLBACK_RATING = 4.9;

// Fallback Maps URL used both as the click-through and when the live
// response doesn't include `googleMapsUri` (we don't request that field
// because the short URL the studio already has is more readable).
const FALLBACK_MAPS_URL = 'https://maps.app.goo.gl/AT7Y3nsn3BVC5Swo8';

export type GoogleRating = {
  /** Rounded to 1 decimal for display — matches Google's own surfaces. */
  rating: number;
  /** Where the number came from — useful for diagnostics, not UI. */
  source: 'live' | 'fallback';
  /** Click-through target — opens the listing on Google Maps. */
  mapsUrl: string;
};

type PlacesApiResponse = {
  rating?: number;
};

/**
 * Returns the studio's current Google rating, cached for 24 hours.
 *
 * Safe to call from any Server Component or Server Action. Never throws —
 * any failure path silently degrades to the hardcoded fallback so the
 * caller can render unconditionally.
 */
export async function getGoogleRating(): Promise<GoogleRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[googleRating] GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not set — using fallback. ' +
          'Add both to .env.local for live data.',
      );
    }
    return {
      rating: FALLBACK_RATING,
      source: 'fallback',
      mapsUrl: FALLBACK_MAPS_URL,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${PLACES_API_BASE}/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        // Tight field mask — only what we display. Each additional field
        // can bump us into a higher billing tier; `rating` alone is
        // already in the Enterprise SKU so anything else here costs the
        // same, but we still keep it tight as a discipline.
        'X-Goog-FieldMask': 'rating',
      },
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(
        `Places API returned ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as PlacesApiResponse;

    if (typeof data.rating !== 'number' || Number.isNaN(data.rating)) {
      throw new Error('Places API response missing or invalid `rating` field');
    }

    // Round to 1 decimal so display is deterministic and matches Google's
    // own surfaces (which never show 2-decimal precision).
    const rounded = Math.round(data.rating * 10) / 10;

    return {
      rating: rounded,
      source: 'live',
      mapsUrl: FALLBACK_MAPS_URL,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[googleRating] Live fetch failed, using fallback:',
        err instanceof Error ? err.message : err,
      );
    }
    return {
      rating: FALLBACK_RATING,
      source: 'fallback',
      mapsUrl: FALLBACK_MAPS_URL,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
