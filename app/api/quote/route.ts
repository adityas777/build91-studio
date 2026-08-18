import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  PROJECT_TYPES,
  STAGES,
  type ProjectTypeId,
  type StageId,
} from '@/lib/solutionsBundles';
import { generateScopePreview } from '@/lib/quoteScope';
import {
  QUOTE_VALIDITY_DAYS,
  formatINR,
  isScaleComplete,
  quoteValidUntil,
  summarizeScale,
  totalFor,
  type ScaleInputs,
} from '@/lib/quotePricing';
import {
  composeOtherEmail,
  composePricedQuoteEmail,
  LOGO_CID,
  LOGO_PUBLIC_PATH,
} from '@/lib/quoteEmailTemplate';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* ───────────────────────────────────────────────────────────────────────
   POST /api/quote
   ───────────────────────────────────────────────────────────────────────
   Receives a Quote-Wizard submission, formats it as an email, sends it
   to the studio via Resend, and logs the structured payload for backup.

   Required env vars to actually send mail:
     RESEND_API_KEY    — get from https://resend.com (free tier)
     QUOTE_TO_EMAIL    — recipient (default: amitmathur@gmail.com)
     RESEND_FROM       — verified sender (default: onboarding@resend.dev,
                         works while you're on Resend's free tier)

   Until those are set, the endpoint still validates + logs + returns 200
   so the wizard's success path works end-to-end.
   ─────────────────────────────────────────────────────────────────────── */

type ContactPayload = {
  projectName?: string;
  location?: string;
  cadUrl?: string;
  name?: string;
  role?: string;
  company?: string;
  phone?: string;
  email?: string;
};

type QuotePayload = {
  // 'other' = the wizard's catch-all type: stage/scale/assets are skipped
  // and no quote is computed — contact details are all we require.
  type?: ProjectTypeId | 'other';
  stage?: StageId | null;
  assetIds?: string[];
  scaleInputs?: ScaleInputs;
  subOptionsByAsset?: Record<string, string[]>;
  contact?: ContactPayload;
};

/** Shape after isValid() narrows the loose incoming payload. */
type ValidatedContact = {
  name: string;
  company: string;
  phone: string;
  email: string;
  projectName?: string;
  location?: string;
  cadUrl?: string;
  role?: string;
};

type ValidatedQuote = {
  type: ProjectTypeId;
  stage: StageId;
  assetIds: string[];
  scaleInputs: ScaleInputs;
  subOptionsByAsset: Record<string, string[]>;
  contact: ValidatedContact;
};

/** Contact rules shared by both flows — mirrors the wizard's step-4 gate. */
function contactValid(c: ContactPayload | undefined): c is ValidatedContact {
  if (!c) return false;
  if (!c.name || c.name.trim().length < 2) return false;
  if (!c.email || !/\S+@\S+\.\S+/.test(c.email)) return false;
  if (!c.phone || c.phone.trim().length < 7) return false;
  if (!c.company) return false;
  return true;
}

function isValid(p: QuotePayload): p is ValidatedQuote {
  if (!p.type || p.type === 'other' || !p.stage) return false;
  if (!Array.isArray(p.assetIds) || p.assetIds.length === 0) return false;
  if (!p.scaleInputs || !isScaleComplete(p.type, p.scaleInputs)) return false;
  if (!contactValid(p.contact)) return false;
  // subOptionsByAsset can be empty for assets without sub-options;
  // just ensure it's an object.
  if (typeof p.subOptionsByAsset !== 'object' || p.subOptionsByAsset === null) {
    return false;
  }
  return true;
}

function buildEmailBody(p: ValidatedQuote): {
  subject: string;
  text: string;
  html: string;
} {
  const projectType = PROJECT_TYPES[p.type];
  const stage = STAGES[p.stage];
  const preview = generateScopePreview({
    type: p.type,
    stage: p.stage,
    scale: p.scaleInputs,
    selectedAssetIds: p.assetIds,
  });
  const c = p.contact;

  // Compute priced totals using the same engine the UI used.
  const totals = totalFor({
    type: p.type,
    scale: p.scaleInputs,
    selectedAssetIds: p.assetIds,
    subOptionsByAsset: p.subOptionsByAsset,
  });
  const scaleSummary = summarizeScale(p.type, p.scaleInputs);

  // Hand the computed figures to the branded template — including the
  // per-line breakdown, which the customer (and cc'd studio) both see.
  return composePricedQuoteEmail({
    name: c.name,
    projectTypeLabel: projectType.label,
    stageLabel: stage.label,
    scaleSummary,
    numbers: {
      isCustom: totals.total === 0,
      items: totals.items.map((item) => ({
        label: item.label,
        isCustom: item.price === null,
        priceFormatted: item.price === null ? 'Custom' : formatINR(item.price),
        priceFull: item.price === null ? '' : formatINR(item.price, 'full'),
        isDroneInvolved: item.isDroneInvolved,
      })),
      totalFormatted: formatINR(totals.total),
      totalFull: formatINR(totals.total, 'full'),
      gstFormatted: formatINR(totals.gst),
      requiresDroneShoot: totals.requiresDroneShoot,
      locationLink: c.location,
      validUntil: quoteValidUntil(),
      validityDays: QUOTE_VALIDITY_DAYS,
      timeline: preview.timeline,
    },
  });
}

/** Email for the 'other' flow — no pricing engine involved. The studio
 *  reviews the requirement and responds personally; the customer was told
 *  "under review, proposal within 24 hours". */
function buildOtherEmailBody(c: ValidatedContact): {
  subject: string;
  text: string;
  html: string;
} {
  // Same branded shell as the priced flow, but the quote block is replaced
  // by a "requirement under review — proposal within 24h" reassurance.
  return composeOtherEmail({
    name: c.name,
    projectName: c.projectName,
  });
}

/** Inline logo attachment (CID) — loaded once and cached. Referenced by the
 *  email header as <img src="cid:LOGO_CID">. Returns null if the file can't
 *  be read, in which case the header falls back to its alt text. On Vercel
 *  the PNG is force-traced into this function via next.config.js
 *  (outputFileTracingIncludes). `undefined` = not yet attempted. */
let logoAttachment:
  | { filename: string; content: Buffer; contentId: string }
  | null
  | undefined;
function getLogoAttachment() {
  if (logoAttachment !== undefined) return logoAttachment;
  try {
    const content = readFileSync(join(process.cwd(), LOGO_PUBLIC_PATH));
    logoAttachment = { filename: 'build91-logo.png', content, contentId: LOGO_CID };
  } catch (err) {
    console.warn(
      '[quote] logo not found — email header will show alt text instead',
      err,
    );
    logoAttachment = null;
  }
  return logoAttachment;
}

/** Log the submission and send it to the studio via Resend (when
 *  configured). Shared by the priced and the 'other' flow. */
async function deliver(
  email: { subject: string; text: string; html: string },
  replyTo: string,
  payload: unknown,
) {
  // Always log — useful both as backup and when Resend isn't configured.
  console.log('[quote] new submission', {
    receivedAt: new Date().toISOString(),
    subject: email.subject,
    payload,
  });

  // Send email if Resend is configured. Silent fallback otherwise so the
  // user-facing wizard still succeeds.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      '[quote] RESEND_API_KEY not set — email will not be delivered. Add it to .env.local to enable.',
    );
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const toEmail = process.env.QUOTE_TO_EMAIL || 'amitmathur@gmail.com';
    const fromEmail =
      process.env.RESEND_FROM || 'Build91 Quote <onboarding@resend.dev>';

    const logo = getLogoAttachment();

    const result = await resend.emails.send({
      from: fromEmail,
      to: [replyTo],
      cc: [toEmail],
      replyTo: toEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments: logo
        ? [{ filename: logo.filename, content: logo.content, contentId: logo.contentId }]
        : undefined,
    });

    if (result.error) {
      console.error('[quote] resend error', result.error);
    } else {
      console.log('[quote] email sent', result.data?.id);
    }
  } catch (err) {
    // Never fail the user-facing request because of an email hiccup.
    console.error('[quote] email send failed', err);
  }
}

export async function POST(req: Request) {
  let body: QuotePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 'Other' flow — contact-only validation, no pricing engine.
  if (body.type === 'other') {
    const c = body.contact;
    if (!contactValid(c)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 },
      );
    }
    await deliver(buildOtherEmailBody(c), c.email, {
      type: 'other',
      contact: c,
    });
    return NextResponse.json({ ok: true });
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'Missing or invalid fields' },
      { status: 400 },
    );
  }

  // body is now narrowed to ValidatedQuote by isValid's type guard.
  const validated = body;
  await deliver(buildEmailBody(validated), validated.contact.email, validated);

  return NextResponse.json({ ok: true });
}
