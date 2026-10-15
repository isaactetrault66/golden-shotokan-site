// Sends the two inquiry emails through Resend (https://resend.com).
// Env: RESEND_API_KEY, CLUB_EMAIL (who receives new inquiries, comma
// separated for several), FROM_EMAIL (e.g. "Golden Shotokan Karate Society <info@iskfgolden.ca>").
import { escapeHtml as h } from './forms.js';

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
  ['Name', (r) => r.name],
  ['Email', (r) => r.email],
  ['Phone', (r) => r.phone],
  ['Interested in', (r) => r.interest],
  ['Heard about us', (r) => r.referral],
  ['Message', (r) => r.message],
];

export function clubEmail(r, id, siteUrl) {
  const rows = ROWS.map(([k, f]) => [k, f(r)]).filter(([, v]) => v);
  return {
    subject: `New inquiry: ${r.name}${r.interest ? ` (${r.interest})` : ''}`,
    html: `<h2>New inquiry #${id}</h2><table cellpadding="6" style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${h(k)}</b></td><td>${h(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}</table><p>Reply to this email to answer ${h(r.name)} directly.</p><p><a href="${h(siteUrl)}/admin#inq-${id}">Open in the admin area</a></p>`,
    text: `New inquiry #${id}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReply to this email to answer ${r.name} directly.\nAdmin: ${siteUrl}/admin#inq-${id}`,
  };
}

export function senderEmail(r, siteUrl) {
  const first = r.name.split(' ')[0];
  return {
    subject: 'Thanks for your message: Golden Shotokan Karate Society',
    html: `<p>Hi ${h(first)},</p>
<p>Thanks for getting in touch with Golden Shotokan Karate Society. We've received your message and a member of the club will reply soon.</p>
<p><b>Classes:</b> Monday and Wednesday, 6:00 to 7:30 pm.<br>
<b>Open training:</b> Friday, 6:00 to 7:30 pm (no instruction).</p>
<p>See you on the floor,<br>Golden Shotokan Karate Society<br><a href="${h(siteUrl)}">${h(siteUrl.replace(/^https?:\/\//, ''))}</a></p>`,
    text: `Hi ${first},\n\nThanks for getting in touch with Golden Shotokan Karate Society. We've received your message and a member of the club will reply soon.\n\nClasses: Monday and Wednesday, 6:00 to 7:30 pm.\nOpen training: Friday, 6:00 to 7:30 pm (no instruction).\n\n${siteUrl}`,
  };
}

export async function sendInquiryEmails(env, r, id) {
  const siteUrl = env.SITE_URL || 'https://iskfgolden.ca';
  const to = String(env.CLUB_EMAIL || '').split(',').map((s) => s.trim()).filter(Boolean);
  const results = [];
  if (to.length) results.push(await send(env, { to, reply_to: r.email, ...clubEmail(r, id, siteUrl) }));
  else results.push({ ok: false, error: 'CLUB_EMAIL not set' });
  results.push(await send(env, { to: [r.email], reply_to: to[0], ...senderEmail(r, siteUrl) }));
  const failed = results.filter((x) => !x.ok).map((x) => x.error);
  return failed.length ? `failed: ${failed.join('; ')}` : 'sent';
}
