// Verifies the Cloudflare Access login token on admin requests, so the admin
// API only answers staff signed in through Cloudflare Access.
// Env: ACCESS_TEAM_DOMAIN (e.g. "goldenshotokan.cloudflareaccess.com"),
//      ACCESS_AUD (the Access application's Audience tag).

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
let certCache = { at: 0, keys: [] };

async function getKeys(teamDomain) {
  if (Date.now() - certCache.at < 3600_000 && certCache.keys.length) return certCache.keys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('Could not load Access certs');
  const { keys } = await res.json();
  certCache = { at: Date.now(), keys };
  return keys;
}

export async function verifyAccess(request, env) {
  const host = new URL(request.url).hostname;
  // Local development only: wrangler on localhost has no Access in front of it.
  if (env.ADMIN_DEV_BYPASS === 'true' && (host === 'localhost' || host === '127.0.0.1')) {
    return { email: 'dev@localhost' };
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    const payload = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
    if (header.alg !== 'RS256') return null;
    const jwk = (await getKeys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const now = Math.floor(Date.now() / 1000);
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (payload.exp && payload.exp < now) return null;
    if (payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
