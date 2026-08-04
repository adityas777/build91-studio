import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/instagram';

/* ───────────────────────────────────────────────────────────────────────
   /api/cron/refresh-instagram-token — weekly token rotation
   ───────────────────────────────────────────────────────────────────────
   Triggered by Vercel Cron (see vercel.json → `0 3 * * 0`, Sun 03:00 UTC
   ≈ Sun 08:30 IST). Every 7 days we exchange the current long-lived IG
   token for a brand-new 60-day one and stash it in Vercel KV under
   `ig:access_token`. As long as one of these 8–9 runs per 60-day window
   succeeds, the token never expires.

   ── Why a GET handler? ──────────────────────────────────────────────
   Vercel Cron triggers with a GET (and a Bearer auth header). It does
   not let you choose POST in the dashboard. So GET it is — guarded by
   the secret below.

   ── Auth ────────────────────────────────────────────────────────────
   Vercel injects `Authorization: Bearer <CRON_SECRET>` automatically
   when you set the env var. We check it explicitly so that even a leaked
   route URL can't trigger a refresh from outside.

   In dev (no CRON_SECRET set) we skip the check — handy for poking the
   endpoint manually before deploy.

   ── Failure mode ────────────────────────────────────────────────────
   If the refresh fails (network, Meta API down, token already revoked),
   we return 500 and Vercel logs the error in the cron history. The
   existing token keeps working from KV until its real expiry, so a
   single failed run is recoverable — only ~8 consecutive failures over
   60 days would actually break things.
   ─────────────────────────────────────────────────────────────────────── */

// Don't pre-render; this endpoint must hit the live token store each call.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await refreshAccessToken();

  if (!result.ok) {
    console.error('[cron] Instagram token refresh failed:', result.error);
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 },
    );
  }

  console.log(
    `[cron] Instagram token refreshed. Expires in ~${Math.round(
      result.expiresInSeconds / 86400,
    )} days.`,
  );
  return NextResponse.json({
    ok: true,
    expiresInSeconds: result.expiresInSeconds,
    expiresInDays: Math.round(result.expiresInSeconds / 86400),
  });
}
