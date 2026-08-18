import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type ContactRequestPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectType?: string;
  message: string;
};

export async function POST(req: Request) {
  let body: ContactRequestPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, phone, company, projectType, message } = body;

  // Validation matching frontend constraints
  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }
  if (!phone || phone.trim().length < 7) {
    return NextResponse.json({ error: 'Phone must be at least 7 characters.' }, { status: 400 });
  }
  if (!message || message.trim().length < 5) {
    return NextResponse.json({ error: 'Message must be at least 5 characters.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.QUOTE_TO_EMAIL || 'contact@build91.in';
  const fromEmail = process.env.RESEND_FROM || 'Build91 Contact Form <onboarding@resend.dev>';

  console.log('[contact] new submission received', {
    receivedAt: new Date().toISOString(),
    payload: { name, email, phone, company, projectType, message },
  });

  if (!apiKey) {
    console.warn(
      '[contact] RESEND_API_KEY not set — email will not be delivered. Add it to .env.local to enable.',
    );
    // Return 200 so the UI's success path still works in dev/test environments
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);

    const subject = `New Project Inquiry from ${name}`;
    const text = `
New Project Inquiry

Name: ${name}
Email: ${email}
Phone: ${phone}
${company ? `Company: ${company}\n` : ''}${projectType ? `Project Type: ${projectType}\n` : ''}
Message:
${message}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Submission</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5efe6; color: #38352f; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #fbf8f2; border: 1px solid #e4dbce; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <h2 style="font-family: Georgia, serif; color: #a9835b; border-bottom: 2px solid #b08d57; padding-bottom: 10px; margin-top: 0;">
      New Project Inquiry
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 130px; color: #8c867a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Name:</td>
        <td style="padding: 8px 0; font-size: 15px;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #8c867a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Email:</td>
        <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #6d4ac9; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #8c867a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Phone:</td>
        <td style="padding: 8px 0; font-size: 15px;"><a href="tel:${phone}" style="color: #6d4ac9; text-decoration: none;">${phone}</a></td>
      </tr>
      ${company ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #8c867a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Company:</td>
        <td style="padding: 8px 0; font-size: 15px;">${company}</td>
      </tr>
      ` : ''}
      ${projectType ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #8c867a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Project Type:</td>
        <td style="padding: 8px 0; font-size: 15px;">${projectType}</td>
      </tr>
      ` : ''}
    </table>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4dbce;">
      <h3 style="font-family: Georgia, serif; color: #a9835b; margin-top: 0; font-size: 16px;">Message / Inquiry Details:</h3>
      <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; background-color: #f5efe6; padding: 15px; border-radius: 8px; margin: 0; border: 1px solid #e4dbce;">
        ${escapeHtml(message)}
      </p>
    </div>
    
    <div style="margin-top: 30px; font-size: 11px; color: #8c867a; text-align: center; border-top: 1px solid #e4dbce; padding-top: 20px;">
      Sent from Build91 Studio Contact Form
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (result.error) {
      console.error('[contact] resend error', result.error);
      return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
    }

    console.log('[contact] email sent successfully', result.data?.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] failed to deliver email', err);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
