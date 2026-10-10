// Sends the two registration emails through Resend (https://resend.com).
// Env: RESEND_API_KEY, CLUB_EMAIL (who receives new registrations, comma
// separated for several), FROM_EMAIL (e.g. "Golden Dojo <register@iskfgolden.ca>").
import { escapeHtml as h } from './registration.js';

async function send(env, msg) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL, ...msg }),
  });
  if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { ok: true };
}

const ROWS = [
  ['Student', (r) => `${r.student_first} ${r.student_last}`],
  ['Date of birth', (r) => `${r.dob} (age ${r.age})`],
  ['Group', (r) => r.program],
  ['Experience', (r) => r.experience],
  ['Family members', (r) => r.family_members],
  ['Parent or guardian', (r) => r.guardian_name],
  ['Email', (r) => r.email],
  ['Phone', (r) => r.phone],
  ['Town', (r) => r.city],
  ['Preferred start', (r) => r.start_date],
  ['Preferred class', (r) => r.preferred_class],
  ['Heard about us', (r) => r.referral],
  ['Medical notes', (r) => r.medical],
  ['Emergency contact', (r) => `${r.emergency_name}, ${r.emergency_phone}`],
  ['Waiver accepted', (r) => (r.waiver ? 'Yes' : 'No')],
  ['Photo consent', (r) => (r.photo_consent ? 'Yes' : 'No')],
];

export function clubEmail(r, id, siteUrl) {
  const rows = ROWS.map(([k, f]) => [k, f(r)]).filter(([, v]) => v);
  return {
    subject: `New registration: ${r.student_first} ${r.student_last} (${r.program || 'no group'})`,
    html: `<h2>New registration #${id}</h2><table cellpadding="6" style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${h(k)}</b></td><td>${h(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}</table><p><a href="${h(siteUrl)}/admin#reg-${id}">Open in the admin area</a></p>`,
    text: `New registration #${id}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nAdmin: ${siteUrl}/admin#reg-${id}`,
  };
}

export function familyEmail(r, siteUrl) {
  const plainName = r.guardian_name && r.age < 18 ? r.guardian_name.split(' ')[0] : r.student_first;
  const name = h(plainName);
  return {
    subject: 'Welcome to Golden Dojo Karate',
    html: `<p>Hi ${name},</p>
<p>Thanks for registering ${h(r.student_first)} with Golden Dojo. We've received your registration and a member of the club will be in touch before your first class.</p>
<p><b>Classes:</b> Monday and Wednesday, 6:00 to 7:30 pm.<br>
<b>Wear:</b> comfortable athletic clothes. We train barefoot.<br>
<b>Arrive:</b> 10 to 15 minutes early for your first class.</p>
<p>More details: <a href="${h(siteUrl)}/first-class">your first class</a>.</p>
<p>See you on the floor,<br>Golden Dojo</p>`,
    text: `Hi ${plainName},\n\nThanks for registering ${r.student_first} with Golden Dojo. A member of the club will be in touch before your first class.\n\nClasses: Monday and Wednesday, 6:00 to 7:30 pm.\nWear comfortable athletic clothes; we train barefoot. Arrive 10 to 15 minutes early.\n\n${siteUrl}/first-class`,
  };
}

export async function sendRegistrationEmails(env, r, id) {
  const siteUrl = env.SITE_URL || 'https://iskfgolden.ca';
  const to = String(env.CLUB_EMAIL || '').split(',').map((s) => s.trim()).filter(Boolean);
  const results = [];
  if (to.length) results.push(await send(env, { to, reply_to: r.email, ...clubEmail(r, id, siteUrl) }));
  else results.push({ ok: false, error: 'CLUB_EMAIL not set' });
  results.push(await send(env, { to: [r.email], reply_to: to[0], ...familyEmail(r, siteUrl) }));
  const failed = results.filter((x) => !x.ok).map((x) => x.error);
  return failed.length ? `failed: ${failed.join('; ')}` : 'sent';
}
