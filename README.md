# Golden Shotokan Karate Association website

Website for the Golden Shotokan Karate Association, an ISKF club in Golden, BC.
Fast static pages for local SEO, an online registration form, and a private
admin area where the club sees and manages every registration.

- **Site:** [Astro](https://astro.build) static pages in `src/pages`
- **Hosting:** Cloudflare Pages (free tier)
- **Registrations:** Cloudflare D1 database (`db/schema.sql`), Pages Functions in `functions/`
- **Emails:** [Resend](https://resend.com): a "New registration" email to the club and a welcome email to the family
- **Admin login:** Cloudflare Access (email one-time code for named staff)
- **Spam:** honeypot field + Cloudflare Turnstile

## How a registration flows

1. A family submits `/register`.
2. `functions/api/register.js` validates it (`lib/registration.js`) and saves it to D1 **first**.
3. It then emails the club (`CLUB_EMAIL`) and the family. Email success or failure is recorded on the row, so a failed email never loses a registration.
4. Staff open `/admin` to see it, change its status (New, Contacted, First class done, Enrolled, Not continuing), add notes, search, filter, export to CSV, or delete it (privacy requests).
5. Staff can also edit class times and a schedule notice under **Class schedule**, and add gradings, seminars, tournaments, club events and holiday closures under **Events**. The public pages show them within about 5 minutes.

Repeat submissions are limited to 5 an hour per device; only a salted hash of the IP address is stored.

## Content still needed from the club

Search the code for `TODO`. Most live in **`src/config.js`**:

- [x] Street address, postal code, phone, email (from the Golden Dojo Facebook page)
- [ ] Exact map pin for the dojo (`SITE.geo`)
- [ ] Domain name (`SITE.url`, also in `astro.config.mjs` via config, `public/robots.txt`, `wrangler.toml`)
- [x] Term prices for 13 to 17 and 18+ (`PRICING`)
- [x] Minimum age 13 (`MIN_AGE` in `lib/registration.js`)
- [ ] Instructor bio and photo for Sensei Tyler Tetrault, plus any assistant instructors (`src/pages/instructors.astro`)
- [ ] Club history (`src/pages/about.astro`)
- [x] Entrance: east side door of the Golden Child Daycare building
- [ ] Real liability waiver text (`src/pages/waiver.astro`), and review the draft privacy policy (`src/pages/privacy.astro`)
- [ ] 15 to 30 real photos to replace the striped photo placeholders (a link-preview image is already in `public/og-image.jpg`)
- [ ] Google review link and Instagram (`SITE.googleReviewUrl`, `SITE.instagram`). Facebook is set to the Golden Dojo page.
- [ ] Confirm these statements, which were written as reasonable defaults: holiday closures follow the school calendar; instructors teaching under-18 students hold criminal record checks and first aid

## Run it locally

```sh
npm install
npm test                                  # unit tests for validation
npm run build
npx wrangler d1 execute golden-shotokan --local --file=db/schema.sql
printf 'ADMIN_DEV_BYPASS=true\nCLUB_EMAIL=you@example.com\n' > .dev.vars
npx wrangler pages dev dist               # http://localhost:8788, admin at /admin
```

`ADMIN_DEV_BYPASS` only works on `localhost`; it is ignored on the live site.

## Deploy (one-time setup)

1. **Cloudflare account** (free). Add the domain to Cloudflare.
2. **Database:** `npx wrangler d1 create golden-shotokan`, put the returned id in `wrangler.toml`, then
   `npx wrangler d1 execute golden-shotokan --remote --file=db/schema.sql`.
3. **Pages project:** Cloudflare dashboard → Workers & Pages → Create → Pages → connect this GitHub repo.
   Build command `npm run build`, output `dist`. Bind the D1 database as `DB` (Settings → Bindings).
4. **Email (Resend):** create an account, verify the domain (adds DNS records), create an API key.
5. **Spam check (Turnstile):** Cloudflare → Turnstile → add widget for the domain. Put the site key in
   `TURNSTILE_SITE_KEY` in `src/config.js`; the secret goes in the env var below.
6. **Environment variables** (Pages → Settings → Variables, mark keys as secrets):

   | Name | Value |
   | --- | --- |
   | `RESEND_API_KEY` | from Resend |
   | `CLUB_EMAIL` | address(es) that receive new registrations, comma separated |
   | `FROM_EMAIL` | e.g. `Golden Shotokan <register@iskfgolden.ca>` (domain verified in Resend) |
   | `SITE_URL` | `https://iskfgolden.ca` |
   | `TURNSTILE_SECRET` | from Turnstile |
   | `ACCESS_TEAM_DOMAIN` | e.g. `iskfgolden.cloudflareaccess.com` |
   | `ACCESS_AUD` | the Access application's Audience (AUD) tag |

7. **Admin login (Cloudflare Access):** Zero Trust → Access → Applications → Add → Self-hosted.
   Domain: your site, paths `admin` and `api/admin`. Policy: Allow, emails of the 1 to 3 staff.
   Login method: One-time PIN. Copy the application's AUD tag into `ACCESS_AUD`.
   The admin API also verifies the Access token itself, so it stays closed even if the policy is misconfigured.
8. **Custom domain:** Pages → Custom domains → add `iskfgolden.ca`.

## After launch (local SEO for Golden, BC)

- Submit `https://iskfgolden.ca/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- Claim the Google Business Profile: category "Karate school", same name, address and phone as `src/config.js`, hours Mon and Wed 6:00 to 7:30 pm, photos, website link.
- List the club on Apple Maps, Bing Places, Yellow Pages Canada, Facebook, the Kicking Horse Country Chamber, Tourism Golden and the ISKF dojo directory, always with identical name, address and phone.
- Ask current families for Google reviews.
