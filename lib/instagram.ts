/* ───────────────────────────────────────────────────────────────────────
   instagram — Live Instagram Reels with 4h ISR cache + KV-stored token
   ───────────────────────────────────────────────────────────────────────
   Server-only. Calls Instagram's Graph API (the Instagram-Login flavour,
   host `graph.instagram.com`, IGAA-prefix tokens) to pull the studio's
   most recent reels.

   ── Token lifecycle ─────────────────────────────────────────────────
     • Long-lived user token, 60-day expiry
     • Stored in Vercel KV under key `ig:access_token`
     • If KV is empty (first run / KV not configured), falls back to
       `process.env.IG_ACCESS_TOKEN` — useful in dev where you don't
       want to pay for KV
     • A weekly Vercel Cron (`/api/cron/refresh-instagram-token`) hits
       Meta's `refresh_access_token` endpoint and writes the rotated
       token back to KV. As long as the cron runs at least once every
       60 days, the token never expires.

   ── Cost shape ──────────────────────────────────────────────────────
     • Instagram Graph API — free, no per-call billing
     • Rate limit: 200 calls/hour per user → trivially under quota
     • 4h ISR cache → 6 fetches/day → ~180/month
     • Vercel KV reads per request: 0 (token stays in module memory
       within a single serverless instance, re-read on cold start)

   ── Failure modes (all handled, all fall back silently) ─────────────
     • Missing env vars                                        → fallback
     • Missing token in KV AND env                             → fallback
     • Network failure / timeout (4s AbortController)          → fallback
     • Non-2xx HTTP response                                   → fallback
     • Response missing `data` or empty after REELS filter     → fallback
   `isFallback: true` on each reel lets callers tell live vs canned apart
   in dev tools without changing what gets rendered.

   ── Media URL expiry ────────────────────────────────────────────────
   Meta's `media_url` is a signed CDN link with ~6h life. Our 4h ISR is
   tuned to refresh before it expires in the typical case. If a URL
   does expire inside the cache window, the <video> tag will fail
   silently — the thumbnail still paints, the IG permalink click-through
   still works. Acceptable for now; if we ever see real reports, the
   upgrade path is a `/api/reel/[id]` proxy route (see roadmap).
   ─────────────────────────────────────────────────────────────────────── */

import 'server-only';
import { FALLBACK_REELS } from './instagram-fallback';

const IG_API_BASE = 'https://graph.instagram.com';
const REVALIDATE_SECONDS = 60 * 60 * 4; // 4 hours
const FETCH_TIMEOUT_MS = 4000;
const FETCH_LIMIT = 25; // pull 25, filter to REELS, take 6
const DISPLAY_LIMIT = 6;

const KV_TOKEN_KEY = 'ig:access_token';

/* ── Public types ───────────────────────────────────────────────────── */

export type Reel = {
  id: string;
  /** Direct CDN URL (live) or local /public path (fallback). */
  mediaUrl: string;
  /** Poster image URL (live IG CDN or local /public path). */
  thumbnailUrl: string;
  /** Public Instagram permalink — always valid even when media_url has expired. */
  permalink: string;
  /** Raw caption text. UI is responsible for truncation. */
  caption: string;
  /** ISO 8601 timestamp from IG. Used for ordering and aria. */
  timestamp: string;
  /** True when this entry came from FALLBACK_REELS, not the live API. */
  isFallback: boolean;
};

export type ReelsResult = {
  reels: Reel[];
  source: 'live' | 'fallback';
};

/* ── Raw API response shape (defensive — every field optional) ──────── */

type IgMediaItem = {
  id?: string;
  caption?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_product_type?: 'FEED' | 'REELS' | 'STORY' | 'AD';
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type IgMediaResponse = {
  data?: IgMediaItem[];
};

/* ── Token resolution: KV first, env fallback ──────────────────────── */

async function getAccessToken(): Promise<string | null> {
  // Try KV first — this is where the cron-refreshed token lives.
  // Lazy-import so KV isn't required at build time (lets the rest of the
  // app type-check before Vercel KV is provisioned).
  try {
    const url = process.env.KV_REST_API_URL;
    const apiToken = process.env.KV_REST_API_TOKEN;
    if (url && apiToken) {
      const { kv } = await import('@vercel/kv');
      const stored = await kv.get<string>(KV_TOKEN_KEY);
      if (stored && typeof stored === 'string') return stored;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[instagram] KV read failed, falling back to env var:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Env fallback — used in dev or as a bootstrap before the first cron.
  const envToken = process.env.IG_ACCESS_TOKEN;
  if (envToken) return envToken;
  return null;
}

/* ── Public API ─────────────────────────────────────────────────────── */

/**
 * Returns up to 8 of the studio's most recent Instagram reels, cached for
 * 4 hours. Safe to call from any Server Component or Server Action; never
 * throws — any failure path silently degrades to the hardcoded fallback
 * so the caller can render unconditionally.
 */
export async function getReels(): Promise<ReelsResult> {
  const igUserId = process.env.IG_BUSINESS_ACCOUNT_ID;
  const token = await getAccessToken();

  if (!igUserId || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[instagram] IG_BUSINESS_ACCOUNT_ID or access token missing — using fallback. ' +
          'Set both in .env.local (or Vercel KV) for live reels.',
      );
    }
    return { reels: FALLBACK_REELS, source: 'fallback' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // URL-encoded comma list (%2C) so we don't depend on the platform's
    // URL builder behaviour for special chars. Mirrors the exact format
    // the studio confirmed in their working curl smoke-test.
    const fields =
      'id%2Ccaption%2Cmedia_type%2Cmedia_product_type%2Cmedia_url%2Cthumbnail_url%2Cpermalink%2Ctimestamp';
    const url =
      `${IG_API_BASE}/${igUserId}/media` +
      `?fields=${fields}` +
      `&limit=${FETCH_LIMIT}` +
      `&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(
        `Instagram API returned ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as IgMediaResponse;
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Instagram API response missing `data` array');
    }

    // Filter to reels only, drop entries missing essential fields, take
    // the first 8.
    const reels: Reel[] = data.data
      .filter(
        (m): m is Required<Pick<IgMediaItem,
          'id' | 'media_url' | 'thumbnail_url' | 'permalink' | 'timestamp'
        >> & IgMediaItem =>
          m.media_product_type === 'REELS' &&
          typeof m.id === 'string' &&
          typeof m.media_url === 'string' &&
          typeof m.thumbnail_url === 'string' &&
          typeof m.permalink === 'string' &&
          typeof m.timestamp === 'string',
      )
      .slice(0, DISPLAY_LIMIT)
      .map((m) => ({
        id: m.id,
        mediaUrl: m.media_url,
        thumbnailUrl: m.thumbnail_url,
        permalink: m.permalink,
        caption: (m.caption ?? '').trim(),
        timestamp: m.timestamp,
        isFallback: false,
      }));

    if (reels.length === 0) {
      throw new Error('Instagram API returned 0 reels after filtering');
    }

    console.log('[instagram] Success! Loaded live reels count:', reels.length);
    return { reels, source: 'live' };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[instagram] Live fetch failed, using fallback:',
        err instanceof Error ? err.message : err,
      );
    }
    return { reels: FALLBACK_REELS, source: 'fallback' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ── Token refresh — called by the weekly cron ─────────────────────── */

export type TokenRefreshResult =
  | { ok: true; expiresInSeconds: number }
  | { ok: false; error: string };

/**
 * Hits Meta's `refresh_access_token` endpoint and writes the rotated
 * token back to KV. Called by `/api/cron/refresh-instagram-token`.
 *
 * Returns a discriminated union so the cron route can log success/
 * failure to Vercel's request logs.
 */
export async function refreshAccessToken(): Promise<TokenRefreshResult> {
  const current = await getAccessToken();
  if (!current) {
    return { ok: false, error: 'No current token in KV or env' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url =
      `${IG_API_BASE}/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${encodeURIComponent(current)}`;

    const res = await fetch(url, {
      signal: controller.signal,
      // Never cache the refresh response — every call must hit Meta.
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Refresh returned ${res.status} ${res.statusText}`,
      };
    }

    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!json.access_token) {
      return { ok: false, error: 'Refresh response missing access_token' };
    }

    // Write the new token to KV. If KV isn't configured, this is a
    // no-op — but the cron route will log it as a soft warning.
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      const { kv } = await import('@vercel/kv');
      await kv.set(KV_TOKEN_KEY, json.access_token);
    } else {
      console.warn(
        '[instagram] Refresh succeeded but KV is not configured — the new ' +
          'token has NOT been persisted. Set KV_REST_API_URL and ' +
          'KV_REST_API_TOKEN, or paste this new token into IG_ACCESS_TOKEN ' +
          'manually before the current one expires.',
      );
    }

    return {
      ok: true,
      expiresInSeconds: json.expires_in ?? 60 * 60 * 24 * 60,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
