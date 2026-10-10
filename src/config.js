// Club details used across every page, the footer and Google structured data.
// Keep name, address and phone EXACTLY the same as the Google Business Profile.
// Values marked TODO still need the real details from the club.
export { MIN_AGE } from '../lib/registration.js';

export const SITE = {
  name: 'Golden Shotokan Karate Association',
  shortName: 'Golden Shotokan',
  url: 'https://goldenshotokan.ca', // TODO: confirm domain
  city: 'Golden',
  region: 'BC',
  regionLong: 'British Columbia',
  country: 'CA',
  street: 'TODO: street address', // TODO
  postalCode: 'V0A 1H0', // TODO: confirm
  phone: 'TODO: phone', // TODO
  email: 'TODO@goldenshotokan.ca', // TODO
  geo: { lat: 51.2985, lng: -116.9631 }, // TODO: set to the dojo's exact location
  affiliation: 'ISKF (International Shotokan Karate Federation)',
  googleReviewUrl: '', // TODO: from the Google Business Profile
  facebook: 'https://www.facebook.com/p/Golden-Dojo-100054606752200/', // "Golden Dojo" page
  instagram: '',
};

// Default class times. Shown in page HTML (for Google) and replaced at
// runtime by the schedule edited in the admin area.
export const DEFAULT_SCHEDULE = [
  { day: 'Monday', start: '18:00', end: '19:30', name: 'Karate class, all ages' },
  { day: 'Wednesday', start: '18:00', end: '19:30', name: 'Karate class, all ages' },
];

// TODO: real monthly price. Shown openly because affordability is the pitch.
export const PRICING = {
  monthly: 'TODO',
  note: 'One of the most affordable activities in Golden. No contracts.',
};


// "18:00", "19:30" -> "6:00 to 7:30 pm"
export const fmtRange = (start, end) => {
  const part = (t) => {
    const [h, m] = t.split(':').map(Number);
    return { text: `${h % 12 || 12}:${String(m).padStart(2, '0')}`, pm: h >= 12 };
  };
  const a = part(start), b = part(end);
  const ap = (p) => (p ? 'pm' : 'am');
  return a.pm === b.pm ? `${a.text} to ${b.text} ${ap(b.pm)}` : `${a.text} ${ap(a.pm)} to ${b.text} ${ap(b.pm)}`;
};

// Classes are mixed-age, from age 10 up. This guide explains who each class
// suits. Split into separate programs later if classes split.
export const AGE_GUIDE = [
  { group: 'Kids', ages: '10 to 12', text: 'Focus, confidence, respect and coordination. Kids train alongside older students and progress through the same belt ranks.' },
  { group: 'Teens', ages: '13 to 17', text: 'Fitness, self-defence and discipline, with a clear path toward black belt.' },
  { group: 'Adults', ages: '18 and up', text: 'Traditional technique, kata and sparring at your own pace. Many adults start with no experience, at any age.' },
  { group: 'Families', ages: 'Parents and kids 10+', text: 'Parents and children 10 and older are welcome to train in the same class.' },
];

// Cloudflare Turnstile public site key (spam check). The secret key lives in
// Cloudflare as TURNSTILE_SECRET. Leave empty to turn the check off locally.
export const TURNSTILE_SITE_KEY = '';
