import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type FeedbackPayload = {
  clientName?: string;
  organization?: string;
  project?: string;
  date?: string;
  company?: string;
  overallSatisfaction: 'happy' | 'neutral' | 'sad';
  quality: 'happy' | 'neutral' | 'sad';
  turnaroundTime: 'happy' | 'neutral' | 'sad';
  communication: 'happy' | 'neutral' | 'sad';
  recommendation: 'yes' | 'maybe' | 'no';
  comments?: string;
};

const RATING_LABELS: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  happy: { label: 'Happy', emoji: '😄', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  neutral: { label: 'Neutral', emoji: '😐', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  sad: { label: 'Sad', emoji: '😞', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  yes: { label: 'Yes (Recommended)', emoji: '👍', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  maybe: { label: 'Maybe', emoji: '🤔', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  no: { label: 'No', emoji: '👎', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

export async function POST(req: Request) {
  let body: FeedbackPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request JSON payload' }, { status: 400 });
  }

  const {
    clientName,
    organization,
    project,
    date,
    company,
    overallSatisfaction,
    quality,
    turnaroundTime,
    communication,
    recommendation,
    comments,
  } = body;

  const resolvedOrg = organization || company || project || '';
  const resolvedClient = clientName || 'Anonymous Client';

  // Validate required rating fields
  if (!overallSatisfaction || !['happy', 'neutral', 'sad'].includes(overallSatisfaction)) {
    return NextResponse.json({ error: 'Overall satisfaction rating is required.' }, { status: 400 });
  }
  if (!quality || !['happy', 'neutral', 'sad'].includes(quality)) {
    return NextResponse.json({ error: 'Quality rating is required.' }, { status: 400 });
  }
  if (!turnaroundTime || !['happy', 'neutral', 'sad'].includes(turnaroundTime)) {
    return NextResponse.json({ error: 'Turnaround time rating is required.' }, { status: 400 });
  }
  if (!communication || !['happy', 'neutral', 'sad'].includes(communication)) {
    return NextResponse.json({ error: 'Communication rating is required.' }, { status: 400 });
  }
  if (!recommendation || !['yes', 'maybe', 'no'].includes(recommendation)) {
    return NextResponse.json({ error: 'Recommendation response is required.' }, { status: 400 });
  }

  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const deliveryDate = date ? date.trim() : 'Unspecified Date';

  console.log('[feedback] new feedback submission received', {
    client: resolvedClient,
    organization: resolvedOrg,
    deliveryDate,
    overallSatisfaction,
    quality,
    turnaroundTime,
    communication,
    recommendation,
    commentsLength: comments?.length || 0,
    timestamp,
  });

  // Google Sheets Webhook Log (if configured)
  const sheetWebhookUrl = process.env.GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycby_XLoWNH_ky_cpuBERTD3la-nbNH_Ed7d-15bcDiJZCVwK0GxWsvipQSGbk3v31iBb/exec';
  if (sheetWebhookUrl) {
    try {
      await fetch(sheetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          clientName: resolvedClient,
          organization: resolvedOrg,
          deliveryDate,
          overallSatisfaction,
          quality,
          turnaroundTime,
          communication,
          recommendation,
          comments: comments || '',
        }),
      });
      console.log('[feedback] logged to Google Sheet webhook successfully');
    } catch (sheetErr) {
      console.error('[feedback] failed to push to Google Sheet webhook', sheetErr);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.FEEDBACK_TO_EMAIL || 'feedback@build91.in';
  const fromEmail = process.env.RESEND_FROM || 'Build91 Client Feedback <feedback@build91.in>';

  if (!apiKey) {
    console.warn(
      '[feedback] RESEND_API_KEY not configured — email delivery skipped in development.',
    );
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    const resend = new Resend(apiKey);

    const subjectHeadline = resolvedOrg ? `${resolvedClient} (${resolvedOrg})` : resolvedClient;
    const subject = `Client Feedback: ${subjectHeadline} — ${RATING_LABELS[overallSatisfaction]?.emoji} ${RATING_LABELS[overallSatisfaction]?.label}`;

    const text = `
Client Feedback Submission
----------------------------------------
Client Name: ${resolvedClient}
${resolvedOrg ? `Organization / Project: ${resolvedOrg}\n` : ''}${deliveryDate !== 'Unspecified Date' ? `Delivery Date: ${deliveryDate}\n` : ''}Submitted At: ${timestamp}

Ratings:
- Overall Satisfaction: ${RATING_LABELS[overallSatisfaction]?.emoji} ${RATING_LABELS[overallSatisfaction]?.label}
- Visual & 3D Quality: ${RATING_LABELS[quality]?.emoji} ${RATING_LABELS[quality]?.label}
- Turnaround Time: ${RATING_LABELS[turnaroundTime]?.emoji} ${RATING_LABELS[turnaroundTime]?.label}
- Communication & Responsiveness: ${RATING_LABELS[communication]?.emoji} ${RATING_LABELS[communication]?.label}
- Would recommend Build91?: ${RATING_LABELS[recommendation]?.emoji} ${RATING_LABELS[recommendation]?.label}

Comments / Additional Notes:
${comments && comments.trim() ? comments.trim() : 'No additional comments provided.'}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Client Feedback Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0E2A; color: #FFFFFF; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0F1538; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
    
    <!-- Top Branding Banner -->
    <div style="background: linear-gradient(135deg, #1C2356 0%, #0F1538 100%); padding: 28px 32px; border-bottom: 1px solid rgba(212, 175, 55, 0.3);">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #D4AF37; font-weight: 700; margin-bottom: 6px;">
        Build91 Studio · Client Feedback
      </div>
      <h2 style="font-size: 24px; font-weight: 600; color: #FFFFFF; margin: 0; letter-spacing: -0.01em;">
        ${escapeHtml(resolvedClient)}
      </h2>
      ${
        resolvedOrg
          ? `<div style="font-size: 14px; color: #D4AF37; margin-top: 4px; font-weight: 500;">
               ${escapeHtml(resolvedOrg)}
             </div>`
          : ''
      }
      ${
        deliveryDate !== 'Unspecified Date'
          ? `<div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px;">
               Delivered: <strong style="color: #FFFFFF;">${escapeHtml(deliveryDate)}</strong>
             </div>`
          : ''
      }
    </div>

    <div style="padding: 32px;">
      <!-- Ratings Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${renderScoreRow('Overall Satisfaction', overallSatisfaction)}
        ${renderScoreRow('Visual & 3D Quality', quality)}
        ${renderScoreRow('Turnaround Time', turnaroundTime)}
        ${renderScoreRow('Communication & Responsiveness', communication)}
        ${renderScoreRow('Would Recommend Build91?', recommendation)}
      </table>

      <!-- Comments Block -->
      <div style="background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; font-weight: 600; margin-bottom: 10px;">
          Additional Feedback / Comments:
        </div>
        <p style="font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.9); margin: 0; white-space: pre-wrap;">
          ${comments && comments.trim() ? escapeHtml(comments.trim()) : '<em style="color: rgba(255,255,255,0.4);">No additional comments provided.</em>'}
        </p>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.45); text-align: center;">
        Recorded on ${timestamp} · Build91 Studio Feedback Pipeline
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      text,
      html,
    });

    if (result.error) {
      console.error('[feedback] resend error', result.error);
      return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err) {
    console.error('[feedback] failed to send email', err);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }
}

function renderScoreRow(label: string, value: string): string {
  const item = RATING_LABELS[value] || { label: value, emoji: '', color: '#fff', bg: 'transparent' };
  return `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
      <td style="padding: 12px 0; font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 400;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 12px 0; text-align: right;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; color: ${item.color}; background-color: ${item.bg}; border: 1px solid ${item.color}33;">
          ${item.emoji} ${item.label}
        </span>
      </td>
    </tr>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
