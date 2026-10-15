// Club details used across every page, the footer and Google structured data.
// Keep name, address and phone EXACTLY the same as the Google Business Profile.
// Values marked TODO still need the real details from the club.
export { MIN_AGE } from '../lib/forms.js';

export const SITE = {
  name: 'Golden Shotokan Karate Society',
  shortName: 'Golden Shotokan',
  url: 'https://iskfgolden.ca', // matches the club email domain
  city: 'Golden',
  region: 'BC',
  regionLong: 'British Columbia',
  country: 'CA',
  street: '818 9th Street North',
  postalCode: 'V0A 1H2',
  phone: '(250) 439-8036',
  email: 'info@iskfgolden.ca',
  entrance: 'East side door of the Golden Child Daycare building',
  geo: { lat: 51.2985, lng: -116.9631 }, // TODO: exact dojo pin (currently central Golden)
  affiliation: 'ISKF (International Shotokan Karate Federation)',
  googleReviewUrl: '', // TODO: from the Google Business Profile
  facebook: 'https://www.facebook.com/p/Golden-Dojo-100054606752200/', // "Golden Dojo" page
  instagram: '',
};

// Default class times. Shown in page HTML (for Google) and replaced at
// runtime by the schedule edited in the admin area.
export const DEFAULT_SCHEDULE = [
  { day: 'Monday', start: '18:00', end: '19:30', name: 'Karate class (ages 13+)' },
  { day: 'Wednesday', start: '18:00', end: '19:30', name: 'Karate class (ages 13+)' },
  { day: 'Friday', start: '18:00', end: '19:30', name: 'Open training (no instruction)' },
];

// Fees are per term and include uniform, insurance and training.
export const PRICING = {
  term: 'September to the end of January',
  includes: 'Uniform, insurance and all training',
  rates: [
    { group: 'Teens (13 to 17)', price: '$495' },
    { group: 'Adults (18+)', price: '$570' },
  ],
  note: 'One of the most affordable activities in Golden.',
}


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

// Classes are for ages 13 and up. This guide explains who each class
// suits. Split into separate programs later if classes split.
export const AGE_GUIDE = [
  { group: 'Teens', ages: '13 to 17', text: 'Fitness, self-defence and discipline, with a clear path toward black belt.' },
  { group: 'Adults', ages: '18 and up', text: 'Traditional technique, kata and sparring at your own pace. Many adults start with no experience, at any age.' },
  { group: 'Families', ages: 'Parents and teens', text: 'Parents and their teenagers are welcome to train in the same class.' },
];

// Cloudflare Turnstile public site key (spam check). The secret key lives in
// Cloudflare as TURNSTILE_SECRET. Leave empty to turn the check off locally.
export const TURNSTILE_SITE_KEY = '';

// The five principles recited at the end of every class.
export const DOJO_KUN = [
  { en: 'Seek perfection of character', ja: '人格完成に努むること', romaji: 'Jinkaku kansei ni tsutomuru koto' },
  { en: 'Be faithful', ja: '誠の道を守ること', romaji: 'Makoto no michi o mamoru koto' },
  { en: 'Endeavor', ja: '努力の精神を養うこと', romaji: 'Doryoku no seishin o yashinau koto' },
  { en: 'Respect others', ja: '礼儀を重んずること', romaji: 'Reigi o omonzuru koto' },
  { en: 'Refrain from violent behaviour', ja: '血気の勇を戒むること', romaji: 'Kekki no yu o imashimuru koto' },
];

export const AFFILIATIONS = [
  { name: 'ISKF (International Shotokan Karate Federation)', url: 'https://www.iskf.com' },
  { name: 'ISKF Canada', url: 'https://www.iskfcanada.com' },
];

// Training clips hosted with the site (in public/video/training). Clips added
// in admin are shown alongside these.
export const TRAINING_CLIPS = [
  { title: 'Kumite practice: black belts', file: 'kumite-1', competition: '2026 ISKF World Shoto Cup', recorded_on: '2026-10-14' },
  { title: 'Kumite practice: black belts, round 2', file: 'kumite-2', competition: '2026 ISKF World Shoto Cup', recorded_on: '2026-10-14' },
  { title: 'Kumite practice: juniors', file: 'kumite-3', competition: '2026 ISKF World Shoto Cup', recorded_on: '2026-10-14' },
  { title: 'Kumite practice: black belts, round 3', file: 'kumite-4', competition: '2026 ISKF World Shoto Cup', recorded_on: '2026-10-14' },
];
