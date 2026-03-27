// Supabase Edge Function: send-email
// Sends plain-text email.
//
// Provider priority:
// 1) SendGrid (supports "Single Sender Verification" without owning a domain)
// 2) Resend (requires verified domain to email arbitrary recipients)

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type RequestBody = {
  to: string;
  subject: string;
  text: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') ?? '';
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
  const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? '';

  if (!EMAIL_FROM) return json(500, { ok: false, error: 'Missing EMAIL_FROM' });

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' });
  }

  const to = (body.to ?? '').trim();
  const subject = (body.subject ?? '').trim();
  const text = (body.text ?? '').trim();

  if (!to || !subject || !text) {
    return json(400, { ok: false, error: 'Missing to/subject/text' });
  }

  // 1) Try SendGrid first (recommended for no-domain setups)
  if (SENDGRID_API_KEY) {
    const sgResp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject }],
        from: { email: EMAIL_FROM },
        content: [{ type: 'text/plain', value: text }],
      }),
    });

    const sgRaw = await sgResp.text();
    if (sgResp.ok) {
      return json(200, { ok: true, provider: 'sendgrid', result: sgRaw || 'accepted' });
    }

    // If SendGrid is configured but failing, return it (don’t silently fall back).
    return json(502, { ok: false, provider: 'sendgrid', error: `SendGrid error: ${sgRaw}` });
  }

  // 2) Fallback to Resend if configured
  if (RESEND_API_KEY) {
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        text,
      }),
    });

    const raw = await resendResp.text();
    if (!resendResp.ok) {
      return json(502, { ok: false, provider: 'resend', error: `Resend error: ${raw}` });
    }

    return json(200, { ok: true, provider: 'resend', result: raw });
  }

  return json(500, { ok: false, error: 'No email provider configured (missing SENDGRID_API_KEY or RESEND_API_KEY)' });
});

