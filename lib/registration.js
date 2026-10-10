// Validation for the public registration form. Pure functions, no I/O, so
// they can be unit tested with `npm test`.

export const MIN_AGE = 13;

export const STATUSES = ['New', 'Contacted', 'First class done', 'Enrolled', 'Not continuing'];
export const PROGRAMS = ['Teens', 'Adults', 'Family'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LIMITS = {
  student_first: 80, student_last: 80, dob: 10, program: 20, experience: 200,
  family_members: 500, guardian_name: 120, email: 200, phone: 40, city: 80,
  start_date: 10, preferred_class: 20, referral: 60, medical: 1000,
  emergency_name: 120, emergency_phone: 40,
};

const REQUIRED = ['student_first', 'student_last', 'dob', 'email', 'phone', 'emergency_name', 'emergency_phone'];

const LABELS = {
  student_first: 'Student first name', student_last: 'Student last name', dob: 'Date of birth',
  email: 'Email', phone: 'Phone', emergency_name: 'Emergency contact name',
  emergency_phone: 'Emergency contact phone', guardian_name: 'Parent or guardian name',
};

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function ageOn(dob, today = new Date()) {
  const [y, m, d] = dob.split('-').map(Number);
  let age = today.getUTCFullYear() - y;
  const beforeBirthday = today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d);
  if (beforeBirthday) age--;
  return age;
}

/**
 * @param {Record<string, string|undefined>} input  raw form fields
 * @returns {{ ok: true, data: object } | { ok: false, error: string, spam?: boolean }}
 */
export function validateRegistration(input, today = new Date()) {
  const get = (k) => String(input[k] ?? '').trim();

  // Honeypot: real people never see or fill this field.
  if (get('website')) return { ok: false, error: 'Submission rejected.', spam: true };

  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const v = get(key);
    if (v.length > max) return { ok: false, error: `${LABELS[key] || key} is too long.` };
    data[key] = v || null;
  }

  for (const key of REQUIRED) {
    if (!data[key]) return { ok: false, error: `${LABELS[key]} is required.` };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (data.phone.replace(/\D/g, '').length < 7) return { ok: false, error: 'Please enter a valid phone number.' };

  if (!isoDate.test(data.dob)) return { ok: false, error: 'Please enter a valid date of birth.' };
  const age = ageOn(data.dob, today);
  if (Number.isNaN(age) || age < 2 || age > 110) return { ok: false, error: 'Please check the date of birth.' };
  if (age < MIN_AGE) return { ok: false, error: `Students must be ${MIN_AGE} or older to join.` };
  if (age < 18 && !data.guardian_name) return { ok: false, error: 'A parent or guardian name is required for students under 18.' };

  if (data.start_date && !isoDate.test(data.start_date)) data.start_date = null;
  if (data.program && !PROGRAMS.includes(data.program)) data.program = null;

  if (get('waiver') !== 'yes') return { ok: false, error: 'Please agree to the liability waiver.' };
  data.waiver = 1;
  data.photo_consent = get('photo_consent') === 'yes' ? 1 : 0;
  data.age = age;
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
