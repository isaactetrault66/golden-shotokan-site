// Validation for the public inquiry form and the admin editors. Pure
// functions, no I/O, so they can be unit tested with `npm test`.

export const MIN_AGE = 13;

export const STATUSES = ['New', 'Replied', 'Joined', 'Closed'];
export const INTERESTS = ['Teens', 'Adults', 'Family', 'Open training', 'Not sure yet'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LIMITS = { name: 120, email: 200, phone: 40, interest: 30, message: 2000, referral: 60 };
const REQUIRED = ['name', 'email', 'message'];
const LABELS = { name: 'Your name', email: 'Email', phone: 'Phone', interest: 'Interested in', message: 'Message', referral: 'How you heard about us' };

/**
 * @param {Record<string, string|undefined>} input  raw form fields
 * @returns {{ ok: true, data: object } | { ok: false, error: string, spam?: boolean }}
 */
export function validateInquiry(input) {
  const get = (k) => String(input[k] ?? '').trim();

  // Honeypot: real people never see or fill this field.
  if (get('website')) return { ok: false, error: 'Submission rejected.', spam: true };

  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const v = get(key);
    if (v.length > max) return { ok: false, error: `${LABELS[key]} is too long.` };
    data[key] = v || null;
  }
  for (const key of REQUIRED) {
    if (!data[key]) return { ok: false, error: `${LABELS[key]} is required.` };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (data.phone && data.phone.replace(/\D/g, '').length < 7) return { ok: false, error: 'Please enter a valid phone number, or leave it empty.' };
  if (data.interest && !INTERESTS.includes(data.interest)) data.interest = null;
  return { ok: true, data };
}

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// CSV cell quoting, with a guard against spreadsheet formula injection.
export function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function validateSchedule(classes) {
  if (!Array.isArray(classes) || classes.length > 20) return { ok: false, error: 'Invalid schedule.' };
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  const out = [];
  for (const c of classes) {
    const day = String(c?.day ?? '');
    const start = String(c?.start ?? '');
    const end = String(c?.end ?? '');
    const name = String(c?.name ?? '').trim().slice(0, 80);
    if (!DAYS.includes(day) || !time.test(start) || !time.test(end) || !name) return { ok: false, error: 'Each class needs a day, start time, end time and name.' };
    if (end <= start) return { ok: false, error: `${day} class ends before it starts.` };
    out.push({ day, start, end, name });
  }
  return { ok: true, classes: out };
}

export const EVENT_KINDS = ['Grading', 'Seminar', 'Tournament', 'Club event', 'Closure'];

export function validateEvent(e) {
  const str = (k, max) => String(e?.[k] ?? '').trim().slice(0, max);
  const out = {
    title: str('title', 120),
    kind: str('kind', 30),
    date: str('date', 10),
    start_time: str('start_time', 5) || null,
    end_time: str('end_time', 5) || null,
    location: str('location', 160) || null,
    description: str('description', 2000) || null,
    published: e?.published === false || e?.published === 0 ? 0 : 1,
  };
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!out.title) return { ok: false, error: 'An event needs a title.' };
  if (!EVENT_KINDS.includes(out.kind)) return { ok: false, error: 'Pick an event type.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date) || Number.isNaN(Date.parse(out.date))) return { ok: false, error: 'An event needs a valid date.' };
  if (out.start_time && !time.test(out.start_time)) return { ok: false, error: 'Start time is not valid.' };
  if (out.end_time && !time.test(out.end_time)) return { ok: false, error: 'End time is not valid.' };
  if (out.start_time && out.end_time && out.end_time <= out.start_time) return { ok: false, error: 'The event ends before it starts.' };
  return { ok: true, event: out };
}

// Training clips: a YouTube or Vimeo link, or a direct link to a video file.
// Returns { kind, id?, src } or null when the link is not one we can show.
export function parseVideoUrl(raw) {
  let u;
  try { u = new URL(String(raw ?? '').trim()); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\.|^m\./, '');
  const ytId = /^[\w-]{11}$/;
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return ytId.test(id) ? { kind: 'youtube', id } : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1];
    return id && ytId.test(id) ? { kind: 'youtube', id } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.match(/(\d{6,})/)?.[1];
    return id ? { kind: 'vimeo', id } : null;
  }
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: 'file', src: u.href };
  return null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
// Round-trips the date so impossible days such as Feb 31 are rejected.
const validDate = (d) => {
  const t = DATE.test(d) ? new Date(d + 'T00:00:00Z') : null;
  return !!t && !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};

export function validateClip(c) {
  const str = (k, max) => String(c?.[k] ?? '').trim().slice(0, max);
  const out = {
    title: str('title', 120),
    url: str('url', 500),
    competition: str('competition', 120) || null,
    recorded_on: str('recorded_on', 10) || null,
    published: c?.published === false || c?.published === 0 ? 0 : 1,
  };
  if (!out.title) return { ok: false, error: 'A clip needs a title.' };
  if (!parseVideoUrl(out.url)) return { ok: false, error: 'Use a YouTube or Vimeo link, or an https link to an .mp4 or .webm file.' };
  if (out.recorded_on && !validDate(out.recorded_on)) return { ok: false, error: 'The recorded date is not valid.' };
  return { ok: true, clip: out };
}

export const RESULT_EVENTS = ['Kata', 'Kumite', 'Team kata', 'Team kumite'];
export const PLACES = ['1st', '2nd', '3rd', '4th', 'Finalist', 'Competed'];

export function validateResult(r) {
  const str = (k, max) => String(r?.[k] ?? '').trim().slice(0, max);
  const out = {
    competition: str('competition', 120),
    competition_date: str('competition_date', 10),
    athlete: str('athlete', 120),
    event_type: str('event_type', 20),
    division: str('division', 120) || null,
    place: str('place', 20),
    note: str('note', 300) || null,
    published: r?.published === false || r?.published === 0 ? 0 : 1,
  };
  if (!out.competition) return { ok: false, error: 'Which tournament is this result from?' };
  if (!validDate(out.competition_date)) return { ok: false, error: 'The tournament needs a valid date.' };
  if (!out.athlete) return { ok: false, error: 'Who competed?' };
  if (!RESULT_EVENTS.includes(out.event_type)) return { ok: false, error: 'Pick kata, kumite or a team event.' };
  if (!PLACES.includes(out.place)) return { ok: false, error: 'Pick a placing.' };
  return { ok: true, result: out };
}
