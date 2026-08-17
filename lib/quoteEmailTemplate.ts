/* ───────────────────────────────────────────────────────────────────────
   Branded quote email template (customer-facing, studio cc'd)
   ───────────────────────────────────────────────────────────────────────
   Renders the "introduction + portfolio + quote" email that goes to the
   lead, with the studio cc'd on the same message (one template for both —
   per studio direction). Faithful to the design in docs/email template.pdf:
   warm cream panel, gold/bronze accents, serif display type.

   Structure (top → bottom):
     • Wordmark + tagline (text-based — no hosted image dependency)
     • Greeting + intro paragraph
     • Four numbered capability blocks (01–04)
     • "clients across …" callout
     • Selected Portfolio cards
     • ►► QUOTE NUMBERS  ◄◄  (priced total, or "under review" for 'other')
     • Closing line + "Warm regards,"
     • Signature card + footer chips

   EMAIL-SAFE RULES honoured here:
     • Table-based layout, everything inline-styled, fixed 600px width.
     • Web-safe font stacks only (Georgia serif / Arial sans) — the site's
       Space Grotesk / Cormorant / Spectral don't load reliably in mail.
     • No <style> blocks (Gmail strips <head>), no flex/grid, no web fonts.
     • Wordmark is text, not an <img>, so it renders with zero hosting.

   CUSTOMER-FACING PRICING RULE (matches lib/quotePricing philosophy):
     Only the QUOTE TOTAL is shown — never the internal per-line breakdown.
     The full per-line payload is still console-logged server-side for the
     studio's records (see app/api/quote/route.ts → deliver()).

   All brand copy below is editable in one place — EDIT HERE, not in JSX.
   ─────────────────────────────────────────────────────────────────────── */

import { SITE } from './constants';

/* ── Palette (sampled from the PDF) ─────────────────────────────────── */
const C = {
  outer: '#ffffff',
  panel: '#f5efe6', // warm cream body
  card: '#fbf8f2', // slightly lighter inner cards
  text: '#38352f',
  muted: '#8c867a',
  gold: '#a9835b', // accent / links-in-brand
  goldNum: '#c9b591', // light gold section numerals
  tagline: '#9c7b4d',
  link: '#6d4ac9', // violet for portfolio / action links
  border: '#e4dbce',
  accentBorder: '#b08d57', // callout + signature left rule
  footer: '#a49e92',
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';

/* ── Logo ───────────────────────────────────────────────────────────────
   Sent as an inline CID attachment (not a hosted <img src>), so it renders
   with zero dependency on the site being deployed and isn't blocked by
   "load remote images" prompts. route.ts → deliver() reads LOGO_PUBLIC_PATH
   and attaches it under LOGO_CID; the header <img> references cid:LOGO_CID.
   Native size 487×374 → displayed at 150×115 (same aspect). */
export const LOGO_CID = 'build91-logo';
export const LOGO_PUBLIC_PATH = 'public/images/B91StudioLogo2.png';
const LOGO_W = 150;
const LOGO_H = 115;

/* ── Editable brand content ─────────────────────────────────────────── */

const TAGLINE = 'Real Estate Visualization & Launch Partner';

/** Opening paragraph. `{firstName}` is substituted at render time. */
const INTRO =
  "I hope you're doing well, {firstName}. Thank you for considering Build91 " +
  'Studio for your project. Here is a quick introduction to how we work — ' +
  'with your quote at the end for reference.';

type Capability = { heading: string; points: [string, string][] };

const CAPABILITIES: Capability[] = [
  {
    heading: 'Project Showcases that Capture Attention',
    points: [
      ['Aerial visualizations', 'plotted highlights & amenity mapping'],
      ['Location videos', 'drone footage meets real-world context'],
      ['Films & microsites', 'built for high-impact launches'],
    ],
  },
  {
    heading: 'High-Fidelity 3D Visualization',
    points: [
      ['Photo-real 3D', 'interiors, exteriors & amenities'],
      ['Design clarity', 'conveys intent, lifts perceived value'],
    ],
  },
  {
    heading: 'Immersive Virtual Experiences',
    points: [
      ['Walkthroughs & 360° tours', 'fully realistic'],
      ['Interactive aerial views', 'explore before visiting'],
    ],
  },
  {
    heading: 'End-to-End Marketing Stack',
    points: [
      ['Websites & brochures', 'conversion-focused, plus social kits'],
      ['Video & creatives', 'always launch-ready'],
    ],
  },
];

type PortfolioItem = {
  eyebrow: string;
  title: string;
  href: string;
  subtitle: string;
};

const PORTFOLIO: PortfolioItem[] = [
  {
    eyebrow: 'Interactive Microsite',
    title: 'Nirman Paradise',
    href: 'https://demo.build91.in/NirmanParadise/index.htm',
    subtitle: 'demo.build91.in/NirmanParadise',
  },
  {
    eyebrow: 'Interactive Microsite',
    title: 'Aishwarya Apartments',
    href: 'https://demo.build91.in/AishwaryaApartments/index.htm',
    subtitle: 'demo.build91.in/AishwaryaApartments',
  },
  {
    eyebrow: 'Video Walkthrough',
    title: 'French Provincial Villa',
    href: 'https://drive.google.com/file/d/1gK2ZZH9KwM5-EkbSdZb_XQtXSyArhd_Q/view?usp=drive_link',
    subtitle: 'Google Drive · walkthrough',
  },
  {
    eyebrow: 'Interior Renders',
    title: 'Interior Render Gallery',
    href: 'https://drive.google.com/file/d/1bxR5EPTMyXy5Bmo8PPgvqZkT7A-wwRSm/view?usp=drive_link',
    subtitle: 'Google Drive · stills',
  },
  {
    eyebrow: 'Cinematic Film · YouTube',
    title: 'Penthouse Design & Visualization',
    href: 'https://youtu.be/7CZp2JnXNLc',
    subtitle: 'Showcase film',
  },
  {
    eyebrow: 'Interior Story · YouTube',
    title: 'Classic Luxury Living',
    href: 'https://youtu.be/pSb0ndJLkvs',
    subtitle: 'A graceful interior story',
  },
  {
    eyebrow: 'Film · Plotted Development',
    title: 'Plotted Township Hindi Showcase Video',
    href: 'https://youtu.be/wNITfiGj18c',
    subtitle: 'Developer credentials and project highlights',
  },
  {
    eyebrow: 'Film · Location Intelligence',
    title: 'Location Intelligence and Amenities Video',
    href: 'https://youtu.be/O3dQcsssgCI',
    subtitle: 'An aerial visual with amenities layout',
  },
];

const CLOSING =
  'This is a tentative quote based on inputs provided on our website. We can showcase more work over a call and would be glad to explore how ' +
  'we can support your project.';

/** Signature — the sending director. Editable; defaults to the PDF sample. */
const SIGNATURE = {
  name: 'Sales',
  title: 'Team · Build91 Studio',
  phone: SITE.phoneDisplay,
  email: 'contact@build91.in',
  website: 'www.studio.build91.in',
  websiteHref: 'https://studio.build91.in',
  instagramHandle: '@build91studio_',
  instagramHref: SITE.social.instagram,
};

const FOOTER_CHIPS = [
  'Project Showcase',
  'Aerial 360s',
  'Virtual Tours',
  '3D Walkthroughs',
  'Amenities',
  'Digital Launchpads',
];

/* ── Small helpers ──────────────────────────────────────────────────── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function firstNameOf(full: string): string {
  return (full.trim().split(/\s+/)[0] || '').trim();
}

/* ── Section renderers (HTML) ───────────────────────────────────────── */

function headerHtml(): string {
  return `
  <tr><td style="padding:8px 32px 20px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody><tr>
      <td valign="middle" style="text-align:left">
        <img src="cid:${LOGO_CID}" alt="Build91 Studio" width="${LOGO_W}" height="${LOGO_H}" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO_W}px;height:${LOGO_H}px" />
      </td>
      <td valign="middle" style="text-align:right;font-family:${SERIF};font-size:17px;color:${C.tagline}">
        ${TAGLINE}
      </td>
    </tr></tbody></table>
  </td></tr>`;
}

function capabilitiesHtml(): string {
  const blocks = CAPABILITIES.map((cap, i) => {
    const num = String(i + 1).padStart(2, '0');
    const points = cap.points
      .map(
        ([label, desc]) => `
        <div style="margin:0 0 7px;font-family:${SANS};font-size:14px;color:${C.text};line-height:1.5">
          <span style="color:${C.gold}">&#9670;</span>
          <b style="color:${C.text}">${escapeHtml(label)}</b>
          <span style="color:${C.muted}"> — ${escapeHtml(desc)}</span>
        </div>`,
      )
      .join('');
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tbody><tr>
      <td valign="top" width="46" style="width:46px;font-family:${SERIF};font-size:22px;color:${C.goldNum};padding-top:2px">${num}</td>
      <td valign="top">
        <div style="font-family:${SERIF};font-size:19px;color:${C.text};margin:0 0 10px">${escapeHtml(cap.heading)}</div>
        ${points}
      </td>
    </tr></tbody></table>`;
  }).join('');
  return blocks;
}

function reachCalloutHtml(): string {
  const reach = SITE.reach;
  const list =
    reach.length > 1
      ? `${reach.slice(0, -1).join(', ')} and ${reach[reach.length - 1]}`
      : reach[0];
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px"><tbody><tr>
    <td style="border-left:3px solid ${C.accentBorder};background:${C.card};padding:14px 18px;font-family:${SANS};font-size:14px;color:${C.text}">
      We currently work with clients across <b>${escapeHtml(list)}</b>.
    </td>
  </tr></tbody></table>`;
}

function portfolioHtml(): string {
  const cards = PORTFOLIO.map(
    (p) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tbody><tr>
      <td style="border:1px solid ${C.border};background:${C.card};padding:14px 18px">
        <div style="font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};margin:0 0 4px">${escapeHtml(p.eyebrow)}</div>
        <a href="${escapeHtml(p.href)}" style="font-family:${SANS};font-size:15px;font-weight:bold;color:${C.link};text-decoration:none">${escapeHtml(p.title)} &rsaquo;</a>
        <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin-top:3px">${escapeHtml(p.subtitle)}</div>
      </td>
    </tr></tbody></table>`,
  ).join('');
  return `
  <div style="font-family:${SERIF};font-size:22px;color:${C.text};margin:8px 0 4px">Selected Portfolio</div>
  <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin:0 0 16px">A few pieces for your perusal — tap any title to view.</div>
  ${cards}`;
}

function signatureHtml(): string {
  const s = SIGNATURE;
  const row = (icon: string, inner: string) => `
    <div style="margin:0 0 8px;font-family:${SANS};font-size:14px;color:${C.text}">
      <span style="display:inline-block;width:22px">${icon}</span>${inner}
    </div>`;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0"><tbody><tr>
    <td style="border-left:3px solid ${C.accentBorder};background:${C.card};padding:20px 22px">
      <div style="font-family:${SERIF};font-size:22px;color:${C.text}">${escapeHtml(s.name)}</div>
      <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};margin:2px 0 14px">${escapeHtml(s.title)}</div>
      <div style="border-top:1px solid ${C.border};padding-top:14px">
        ${row('📞', `<a href="tel:${escapeHtml(s.phone.replace(/\s/g, ''))}" style="color:${C.text};text-decoration:none">${escapeHtml(s.phone)}</a>`)}
        ${row('✉️', `<a href="mailto:${escapeHtml(s.email)}" style="color:${C.link};text-decoration:none">${escapeHtml(s.email)}</a>`)}
        ${row('🌐', `<a href="${escapeHtml(s.websiteHref)}" style="color:${C.link};text-decoration:none">${escapeHtml(s.website)}</a>`)}
        ${row('📸', `<a href="${escapeHtml(s.instagramHref)}" style="color:${C.link};text-decoration:none">${escapeHtml(s.instagramHandle)}</a>`)}
      </div>
    </td>
  </tr></tbody></table>`;
}

function footerHtml(): string {
  const chips = FOOTER_CHIPS.map((c) => escapeHtml(c.toUpperCase())).join(
    ' &middot; ',
  );
  return `
  <div style="text-align:center;font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:${C.footer};padding:22px 12px 4px;line-height:1.9">
    ${chips}
  </div>`;
}

/** Outer shell — wraps the cream body panel. `middleHtml` is everything from
 *  the greeting down to (and including) the footer. */
function shell(bodyHtml: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.outer};margin:0;padding:0"><tbody><tr>
  <td align="center" style="padding:24px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${C.outer}"><tbody>
      ${headerHtml()}
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel}"><tbody><tr>
          <td style="padding:30px 32px 8px">
            ${bodyHtml}
          </td>
        </tr></tbody></table>
      </td></tr>
    </tbody></table>
  </td>
</tr></tbody></table>`.trim();
}

/* ── Public API ─────────────────────────────────────────────────────── */

/** One priced asset line in the quote breakdown. */
export type QuoteLineItem = {
  label: string;
  isCustom: boolean; // price === null → shown as "Custom"
  priceFormatted: string; // e.g. "₹1.8 L" (or "Custom")
  priceFull: string; // e.g. "₹1,84,450" (empty when custom)
  isDroneInvolved: boolean;
};

export type QuoteNumbers = {
  isCustom: boolean; // total === 0 → "quote on call"
  items: QuoteLineItem[]; // per-line breakdown (shown above the total)
  totalFormatted: string; // e.g. "₹2.5 L"
  totalFull: string; // e.g. "₹2,50,000"
  gstFormatted: string;
  requiresDroneShoot: boolean;
  locationLink?: string;
  validUntil: string;
  validityDays: number;
  timeline: string;
};

export type QuoteEmailInput = {
  name: string;
  projectTypeLabel: string;
  stageLabel: string;
  scaleSummary: string;
  numbers: QuoteNumbers;
};

export type OtherEmailInput = {
  name: string;
  projectName?: string;
};

/** The priced quote block that sits just above the closing line. */
function quoteNumbersHtml(
  n: QuoteNumbers,
  typeLabel: string,
  stageLabel: string,
  scaleSummary: string,
): string {
  const summary = `${escapeHtml(typeLabel)} &middot; ${escapeHtml(
    stageLabel,
  )} &middot; ${escapeHtml(scaleSummary)}`;

  // Bespoke (total === 0): skip the breakdown, invite a call.
  if (n.isCustom) {
    return `
  <div style="font-family:${SERIF};font-size:22px;color:${C.text};margin:26px 0 4px">Your Quote</div>
  <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin:0 0 12px">${summary}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tbody><tr>
    <td style="border-left:3px solid ${C.accentBorder};background:${C.card};padding:20px 22px">
      <div style="font-family:${SERIF};font-size:18px;color:${C.text};font-style:italic">Your selection is bespoke at this scale — we'll confirm the figure on a quick call.</div>
      <div style="border-top:1px solid ${C.border};margin-top:14px;padding-top:12px;font-family:${SANS};font-size:13px;color:${C.text}"><b>Recommended timeline:</b> ${escapeHtml(n.timeline)}</div>
      <div style="font-family:${SANS};font-size:12px;color:${C.muted};margin-top:6px">Valid for ${n.validityDays} days · until ${escapeHtml(n.validUntil)}.</div>
    </td>
  </tr></tbody></table>`;
  }

  // Per-line breakdown → total → GST/drone → timeline/validity.
  const rows = n.items
    .map((it) => {
      const drone = it.isDroneInvolved
        ? ` <span style="color:${C.gold};font-size:11px;white-space:nowrap">[drone-involved]</span>`
        : '';
      const price = it.isCustom
        ? `<span style="color:${C.muted};text-transform:uppercase;font-size:11px">Custom</span>`
        : `<span style="color:${C.text}">${escapeHtml(it.priceFormatted)}</span> <span style="color:${C.muted};font-size:11px">(${escapeHtml(it.priceFull)})</span>`;
      return `
        <tr>
          <td style="padding:7px 12px 7px 0;font-family:${SANS};font-size:13px;color:${C.text};line-height:1.4;border-bottom:1px solid ${C.border};vertical-align:top">${escapeHtml(it.label)}${drone}</td>
          <td style="padding:7px 0;font-family:${SANS};font-size:13px;text-align:right;white-space:nowrap;border-bottom:1px solid ${C.border};vertical-align:top">${price}</td>
        </tr>`;
    })
    .join('');

  const droneNote = n.requiresDroneShoot
    ? `<div style="font-family:${SANS};font-size:12px;color:${C.muted};margin-top:4px">+ Drone shoot (video + images) quoted separately by location${
        n.locationLink
          ? ` — <a href="${escapeHtml(n.locationLink)}" style="color:${C.link}">site map</a>`
          : ''
      }.</div>`
    : '';

  return `
  <div style="font-family:${SERIF};font-size:22px;color:${C.text};margin:26px 0 4px">Your Quote</div>
  <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin:0 0 12px">${summary}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tbody><tr>
    <td style="border-left:3px solid ${C.accentBorder};background:${C.card};padding:20px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>
        ${rows}
        <tr>
          <td style="padding:14px 12px 0 0;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};vertical-align:bottom">Quote Total</td>
          <td style="padding:14px 0 0;text-align:right;white-space:nowrap;vertical-align:bottom"><span style="font-family:${SERIF};font-size:26px;color:${C.text}">${escapeHtml(n.totalFormatted)}</span> <span style="font-family:${SANS};font-size:11px;color:${C.muted}">(${escapeHtml(n.totalFull)})</span></td>
        </tr>
      </tbody></table>
      <div style="font-family:${SANS};font-size:12px;color:${C.muted};margin-top:10px">* Exclusive of GST (18% = ${escapeHtml(n.gstFormatted)}), which is billed additionally.</div>
      ${droneNote}
      <div style="border-top:1px solid ${C.border};margin-top:14px;padding-top:12px;font-family:${SANS};font-size:13px;color:${C.text}"><b>Recommended timeline:</b> ${escapeHtml(n.timeline)}</div>
      <div style="font-family:${SANS};font-size:12px;color:${C.muted};margin-top:6px">Valid for ${n.validityDays} days · until ${escapeHtml(n.validUntil)}.</div>
    </td>
  </tr></tbody></table>`;
}

/** 'Other' flow — no number; a reassurance that a proposal is coming. */
function underReviewHtml(): string {
  return `
  <div style="font-family:${SERIF};font-size:22px;color:${C.text};margin:26px 0 8px">Your Requirement</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tbody><tr>
    <td style="border-left:3px solid ${C.accentBorder};background:${C.card};padding:18px 22px;font-family:${SANS};font-size:14px;color:${C.text};line-height:1.55">
      Your requirement is with our team for review. A tailored proposal will
      reach you <b>within 24 hours</b> — we may reach out for a detail or two
      in the meantime.
    </td>
  </tr></tbody></table>`;
}

function greetingAndIntroHtml(name: string): string {
  const fn = firstNameOf(name) || 'there';
  const intro = INTRO.replace('{firstName}', escapeHtml(fn));
  return `
  <div style="font-family:${SANS};font-size:15px;color:${C.text};margin:0 0 16px">Dear ${escapeHtml(fn)},</div>
  <div style="font-family:${SANS};font-size:15px;color:${C.text};line-height:1.6;margin:0 0 24px">${intro}</div>`;
}

function closingHtml(): string {
  return `
  <div style="font-family:${SANS};font-size:15px;color:${C.text};line-height:1.6;margin:22px 0 18px">${escapeHtml(CLOSING)}</div>
  <div style="font-family:${SANS};font-size:15px;color:${C.text};margin:0 0 4px">Warm regards,</div>`;
}

export function composePricedQuoteEmail(input: QuoteEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your Build91 Studio proposal — ${input.projectTypeLabel}`;
  const middle =
    greetingAndIntroHtml(input.name) +
    capabilitiesHtml() +
    reachCalloutHtml() +
    portfolioHtml() +
    quoteNumbersHtml(
      input.numbers,
      input.projectTypeLabel,
      input.stageLabel,
      input.scaleSummary,
    ) +
    closingHtml() +
    signatureHtml() +
    footerHtml();
  const html = shell(middle);
  const text = pricedText(input);
  return { subject, html, text };
}

export function composeOtherEmail(input: OtherEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Build91 Studio — your project & next steps';
  const middle =
    greetingAndIntroHtml(input.name) +
    capabilitiesHtml() +
    reachCalloutHtml() +
    portfolioHtml() +
    underReviewHtml() +
    closingHtml() +
    signatureHtml() +
    footerHtml();
  const html = shell(middle);
  const text = otherText(input);
  return { subject, html, text };
}

/* ── Plain-text alternatives (deliverability + non-HTML clients) ─────── */

function capabilitiesText(): string {
  return CAPABILITIES.map((cap, i) => {
    const pts = cap.points
      .map(([l, d]) => `   - ${l} — ${d}`)
      .join('\n');
    return `${String(i + 1).padStart(2, '0')}  ${cap.heading}\n${pts}`;
  }).join('\n\n');
}

function portfolioText(): string {
  return PORTFOLIO.map(
    (p) => `- ${p.title} (${p.eyebrow}) — ${p.href}`,
  ).join('\n');
}

function signatureText(): string {
  const s = SIGNATURE;
  return [
    s.name,
    s.title,
    `Phone: ${s.phone}`,
    `Email: ${s.email}`,
    `Web: ${s.website}`,
    `Instagram: ${s.instagramHandle}`,
  ].join('\n');
}

function commonTextTop(name: string): string {
  const fn = firstNameOf(name) || 'there';
  return [
    `Dear ${fn},`,
    '',
    INTRO.replace('{firstName}', fn),
    '',
    capabilitiesText(),
    '',
    `We currently work with clients across ${SITE.reach.join(', ')}.`,
    '',
    'SELECTED PORTFOLIO',
    portfolioText(),
  ].join('\n');
}

function pricedText(input: QuoteEmailInput): string {
  const n = input.numbers;
  const breakdown = n.items
    .map((it) => {
      const drone = it.isDroneInvolved ? ' [drone-involved]' : '';
      const price = it.isCustom
        ? 'Custom'
        : `${it.priceFormatted} (${it.priceFull})`;
      return `  - ${it.label}${drone}: ${price}`;
    })
    .join('\n');
  const quote = n.isCustom
    ? "Your selection is bespoke at this scale — we'll confirm the figure on a call."
    : [
      breakdown,
      `Quote Total: ${n.totalFormatted} (${n.totalFull})`,
      `* Exclusive of GST (18% = ${n.gstFormatted}), billed additionally.`,
      n.requiresDroneShoot
        ? `+ Drone shoot quoted separately by location${n.locationLink ? ` (${n.locationLink})` : ''}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  return [
    commonTextTop(input.name),
    '',
    'YOUR QUOTE',
    `${input.projectTypeLabel} · ${input.stageLabel} · ${input.scaleSummary}`,
    quote,
    `Recommended timeline: ${n.timeline}`,
    `Valid for ${n.validityDays} days · until ${n.validUntil}.`,
    '',
    CLOSING,
    '',
    'Warm regards,',
    signatureText(),
  ].join('\n');
}

function otherText(input: OtherEmailInput): string {
  return [
    commonTextTop(input.name),
    '',
    'YOUR REQUIREMENT',
    'Your requirement is with our team for review. A tailored proposal will reach you within 24 hours.',
    '',
    CLOSING,
    '',
    'Warm regards,',
    signatureText(),
  ].join('\n');
}
