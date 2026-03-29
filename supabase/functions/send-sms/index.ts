// Supabase Edge Function: send-sms
// Sends SMS via Twilio REST API.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type RequestBody = {
  to: string; // E.164, e.g. +60123456789
  message: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toBase64(s: string) {
  return btoa(s);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
  const TWILIO_FROM = Deno.env.get('TWILIO_FROM') ?? '';

  if (!TWILIO_ACCOUNT_SID) return json(500, { ok: false, error: 'Missing TWILIO_ACCOUNT_SID' });
  if (!TWILIO_AUTH_TOKEN) return json(500, { ok: false, error: 'Missing TWILIO_AUTH_TOKEN' });
  if (!TWILIO_FROM) return json(500, { ok: false, error: 'Missing TWILIO_FROM' });

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' });
  }

  const to = (body.to ?? '').trim();
  const message = (body.message ?? '').trim();
  if (!to || !message) return json(400, { ok: false, error: 'Missing to/message' });

  const form = new URLSearchParams();
  form.set('To', to);
  form.set('From', TWILIO_FROM);
  form.set('Body', message);

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = toBase64(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const resp = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form.toString(),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    return json(502, { ok: false, provider: 'twilio', error: `Twilio error: ${raw}` });
  }

  return json(200, { ok: true, provider: 'twilio', result: raw });
});

