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
  PRICING_VERSION,
  QUOTE_VALIDITY_DAYS,
  effectiveDate,
  formatINR,
  isScaleComplete,
  quoteValidUntil,
  summarizeScale,
  totalFor,
  type ScaleInputs,
} from '@/lib/quotePricing';

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
  const validUntil = quoteValidUntil();
  const scaleSummary = summarizeScale(p.type, p.scaleInputs);

  // Per-line asset breakdown with prices for the studio's records.
  const assetLines = totals.items
    .map((item) => {
      const subs = p.subOptionsByAsset[item.id] ?? [];
      const subPart = subs.length > 0 ? `   (sub: ${subs.join(', ')})` : '';
      const droneFlag = item.isDroneInvolved ? '  [drone-involved]' : '';
      return `  ✓ ${item.label.padEnd(48)}${formatINR(item.price)} (${formatINR(item.price, 'full')})${subPart}${droneFlag}`;
    })
    .join('\n');

  const projectMeta = [
    c.projectName ? `Project name: ${c.projectName}` : null,
    c.location ? `Location: ${c.location}` : null,
    c.cadUrl ? `CAD: ${c.cadUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const totalForSubject =
    totals.total === 0 ? 'Custom' : formatINR(totals.total);
  const subjectLabel = c.projectName || c.company || projectType.label;
  const subject = `New quote — ${subjectLabel} (${projectType.label}) — ${totalForSubject}`;

  const text = [
    'New quote request from Build91 Studio',
    '',
    'PROJECT',
    '─────────',
    `Type: ${projectType.label}`,
    `Stage: ${stage.label}`,
    `Scale: ${scaleSummary}`,
    projectMeta || '(no extra project details shared)',
    '',
    'ASSETS REQUESTED (internal — per-line for studio reference)',
    '─────────',
    assetLines,
    '',
    'QUOTE',
    '─────────',
    `Quote Total:  ${formatINR(totals.total)}  (${formatINR(totals.total, 'full')})`,
    `GST (18%):    ${formatINR(totals.gst)}  — informational only, NOT added to total`,
    totals.requiresDroneShoot
      ? `+ Drone shoot: quoted by location  ${c.location ? `[Maps: ${c.location}]` : '[⚠ Maps link missing!]'}`
      : null,
    `Valid: ${QUOTE_VALIDITY_DAYS} days · until ${validUntil}`,
    `Pricing version: ${PRICING_VERSION} · effective ${effectiveDate()}`,
    '',
    `Recommended timeline: ${preview.timeline}`,
    '',
    'CONTACT',
    '─────────',
    `Name: ${c.name}`,
    c.role ? `Role: ${c.role}` : null,
    `Company: ${c.company}`,
    `Phone: ${c.phone}`,
    `Email: ${c.email}`,
    '',
    `Received: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  // Capture optional fields into local consts so TS narrows through the
  // ternary cleanly (property-access narrowing is unreliable inside
  // template literals).
  const pn = c.projectName;
  const loc = c.location;
  const cad = c.cadUrl;
  const role = c.role;
  const rowProjectName = pn
    ? `<tr><td>Project name:</td><td>${escapeHtml(pn)}</td></tr>`
    : '';
  const rowLocation = loc
    ? `<tr><td>Location:</td><td>${escapeHtml(loc)}</td></tr>`
    : '';
  const rowCad = cad
    ? `<tr><td>CAD:</td><td><a href="${escapeHtml(cad)}">${escapeHtml(cad)}</a></td></tr>`
    : '';
  const rowRole = role
    ? `<tr><td>Role:</td><td>${escapeHtml(role)}</td></tr>`
    : '';

  // Quote line items (studio-internal, per-asset prices kept for reference)
  const quoteRows = totals.items
    .map((item) => {
      const priceCell =
        item.price === null
          ? `<span style="color:#999;font-size:12px;text-transform:uppercase">Custom</span>`
          : `<span style="color:#222">${formatINR(item.price)}</span> <span style="color:#999;font-size:11px">(${formatINR(item.price, 'full')})</span>`;
      const droneFlag = item.isDroneInvolved
        ? ` <span style="color:#E0B872;font-size:11px">[drone-involved]</span>`
        : '';
      return `<tr><td style="padding:3px 8px 3px 0">${escapeHtml(item.label)}${droneFlag}</td><td style="padding:3px 0;text-align:right">${priceCell}</td></tr>`;
    })
    .join('');

  const droneAddendumHtml = totals.requiresDroneShoot
    ? `<p style="margin:14px 0 0;padding:8px 12px;border-left:3px solid #E0B872;background:#fff8ec;color:#5a4a1c;font-size:13px">
        + Drone shoot (video + images) — <b>quoted by location</b>.
        ${loc ? `Maps: <a href="${escapeHtml(loc)}">${escapeHtml(loc)}</a>` : `<span style="color:#c00">⚠ Maps link missing</span>`}
       </p>`
    : '';

  // Total is GST-exclusive. GST shown as a fine-print note only.
  const totalsHtml = totals.total === 0
    ? `<p style="margin:14px 0 0;color:#666;font-style:italic">This combination isn't standard at the chosen scale — quote on call.</p>`
    : `<table cellpadding="2" style="margin-top:10px;border-top:1px solid #ddd;padding-top:10px;width:100%;max-width:480px">
        <tbody>
          <tr><td><b>Quote Total</b></td><td style="text-align:right"><b style="color:#7C3AED;font-size:18px">${formatINR(totals.total)}</b> <span style="color:#999;font-size:11px">(${formatINR(totals.total, 'full')})</span></td></tr>
        </tbody>
      </table>
      <p style="margin:6px 0 0;color:#999;font-size:11px">
        * Quotes are exclusive of GST (18% = ${formatINR(totals.gst)} for reference, NOT added to total)
      </p>`;

  // Minimal HTML for inboxes that prefer it (Gmail etc.). Plain monospace
  // styling — no marketing-email theatrics.
  const html = `
<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#222;line-height:1.55">
  <h2 style="margin:0 0 8px;font-size:18px">New quote request</h2>
  <p style="margin:0 0 18px;color:#666">studio.build91.in · ${new Date().toLocaleString('en-IN')}</p>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">PROJECT</h3>
  <table cellpadding="2"><tbody>
    <tr><td>Type:</td><td><b>${projectType.label}</b></td></tr>
    <tr><td>Stage:</td><td>${stage.label}</td></tr>
    <tr><td>Scale:</td><td>${escapeHtml(scaleSummary)}</td></tr>
    ${rowProjectName}
    ${rowLocation}
    ${rowCad}
  </tbody></table>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">QUOTE</h3>
  <table cellpadding="0" style="width:100%;max-width:480px">
    <tbody>${quoteRows}</tbody>
  </table>
  ${totalsHtml}
  ${droneAddendumHtml}
  <p style="margin:8px 0 0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px">
    Valid ${QUOTE_VALIDITY_DAYS} days · until ${validUntil} · ${PRICING_VERSION} · effective ${effectiveDate()}
  </p>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">SCOPE NOTES</h3>
  <p style="margin:0 0 6px"><b>Recommended timeline:</b> ${preview.timeline}</p>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">CONTACT</h3>
  <table cellpadding="2"><tbody>
    <tr><td>Name:</td><td><b>${escapeHtml(c.name)}</b></td></tr>
    ${rowRole}
    <tr><td>Company:</td><td>${escapeHtml(c.company)}</td></tr>
    <tr><td>Phone:</td><td><a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a></td></tr>
    <tr><td>Email:</td><td><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></td></tr>
  </tbody></table>
</div>
`.trim();

  return { subject, text, html };
}

/** Email for the 'other' flow — no pricing engine involved. The studio
 *  reviews the requirement and responds personally; the customer was told
 *  "under review, proposal within 24 hours". */
function buildOtherEmailBody(c: ValidatedContact): {
  subject: string;
  text: string;
  html: string;
} {
  const subjectLabel = c.projectName || c.company;
  const subject = `New custom requirement — ${subjectLabel} (Other)`;

  const projectMeta = [
    c.projectName ? `Project name: ${c.projectName}` : null,
    c.location ? `Location: ${c.location}` : null,
    c.cadUrl ? `CAD: ${c.cadUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const text = [
    'New CUSTOM requirement from the Build91 quote wizard',
    '',
    'Project type "Other" — lifecycle, scale and asset steps were skipped',
    'and NO quote was calculated or shown.',
    '',
    'The customer saw: "Your requirement is under review. We may contact',
    'you for more details. The detailed proposal arrives within 24 hours."',
    '→ Review and respond personally (email or phone) within 24 hours.',
    '',
    'PROJECT',
    '─────────',
    'Type: Other / Custom',
    projectMeta || '(no extra project details shared)',
    '',
    'CONTACT',
    '─────────',
    `Name: ${c.name}`,
    c.role ? `Role: ${c.role}` : null,
    `Company: ${c.company}`,
    `Phone: ${c.phone}`,
    `Email: ${c.email}`,
    '',
    `Received: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  const pn = c.projectName;
  const loc = c.location;
  const cad = c.cadUrl;
  const role = c.role;
  const rowProjectName = pn
    ? `<tr><td>Project name:</td><td>${escapeHtml(pn)}</td></tr>`
    : '';
  const rowLocation = loc
    ? `<tr><td>Location:</td><td>${escapeHtml(loc)}</td></tr>`
    : '';
  const rowCad = cad
    ? `<tr><td>CAD:</td><td><a href="${escapeHtml(cad)}">${escapeHtml(cad)}</a></td></tr>`
    : '';
  const rowRole = role
    ? `<tr><td>Role:</td><td>${escapeHtml(role)}</td></tr>`
    : '';

  const html = `
<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#222;line-height:1.55">
  <h2 style="margin:0 0 8px;font-size:18px">New custom requirement</h2>
  <p style="margin:0 0 18px;color:#666">studio.build91.in · ${new Date().toLocaleString('en-IN')}</p>

  <p style="margin:0 0 18px;padding:8px 12px;border-left:3px solid #7C3AED;background:#f5f0ff;color:#3b2a63;font-size:13px">
    Project type <b>"Other"</b> — wizard steps skipped, <b>no auto-quote</b>.
    Customer was told their requirement is under review and a proposal
    arrives within 24 hours. Review and respond personally.
  </p>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">PROJECT</h3>
  <table cellpadding="2"><tbody>
    <tr><td>Type:</td><td><b>Other / Custom</b></td></tr>
    ${rowProjectName}
    ${rowLocation}
    ${rowCad}
  </tbody></table>

  <h3 style="margin:18px 0 6px;font-size:13px;letter-spacing:1px;color:#7C3AED">CONTACT</h3>
  <table cellpadding="2"><tbody>
    <tr><td>Name:</td><td><b>${escapeHtml(c.name)}</b></td></tr>
    ${rowRole}
    <tr><td>Company:</td><td>${escapeHtml(c.company)}</td></tr>
    <tr><td>Phone:</td><td><a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a></td></tr>
    <tr><td>Email:</td><td><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></td></tr>
  </tbody></table>
</div>
`.trim();

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
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
