// POST /api/register: saves a registration, then emails the club and the family.
import { validateRegistration } from '../../lib/registration.js';
import { sendRegistrationEmails } from '../../lib/email.js';
import { json } from '../../lib/http.js';

const COLUMNS = [
  'student_first', 'student_last', 'dob', 'program', 'experience', 'family_members', 'guardian_name',
  'email', 'phone', 'city', 'start_date', 'preferred_class', 'referral', 'medical',
  'emergency_name', 'emergency_phone', 'waiver', 'photo_consent',
];

const MAX_PER_HOUR = 5;

// Privacy-friendly: store a salted hash of the IP, never the IP itself.
async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // spam check off until configured
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

export async function onRequestPost({ request, env, waitUntil }) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const fail = (error, status = 400) =>
    wantsJson
      ? json({ error }, status)
      : new Response(`${error}\n\nPlease go back and try again.`, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  let form;
  try {
    form = Object.fromEntries(await request.formData());
  } catch {
    return fail('Could not read the form.');
  }

  const result = validateRegistration(form);
  if (!result.ok) {
    // Pretend success to bots that fill the honeypot.
    if (result.spam) return wantsJson ? json({ ok: true }) : Response.redirect(new URL('/register/thanks', request.url), 303);
    return fail(result.error);
  }

  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await turnstileOk(env, form['cf-turnstile-response'], ip))) {
    return fail('The spam check failed. Please refresh the page and try again.');
  }

  const ipHash = ip ? await hashIp(ip, env.IP_SALT || env.SITE_URL || 'golden-shotokan') : null;
  if (ipHash) {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM registrations WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-1 hour')"
    ).bind(ipHash).first('n');
    if (recent >= MAX_PER_HOUR) {
      return fail('Too many registrations from this device in the last hour. Please email us instead.', 429);
    }
  }

  const r = result.data;
  const row = await env.DB.prepare(
    `INSERT INTO registrations (${COLUMNS.join(', ')}, ip_hash) VALUES (${COLUMNS.map(() => '?').join(', ')}, ?) RETURNING id`
  )
    .bind(...COLUMNS.map((c) => r[c]), ipHash)
    .first();
  const id = row.id;

  // Saved first, so a failed email never loses a registration.
  waitUntil(
    sendRegistrationEmails(env, r, id).then((status) =>
      env.DB.prepare('UPDATE registrations SET email_status = ? WHERE id = ?').bind(status, id).run()
    )
  );

  return wantsJson ? json({ ok: true, id }) : Response.redirect(new URL('/register/thanks', request.url), 303);
}
