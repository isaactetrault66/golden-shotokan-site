// GET /api/admin/clips (all), POST /api/admin/clips (create)
import { json } from '../../../lib/http.js';
import { validateClip } from '../../../lib/forms.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM clips ORDER BY COALESCE(recorded_on, created_at) DESC').all();
  return json({ clips: results });
}

export async function onRequestPost({ request, env }) {
  const v = validateClip(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const c = v.clip;
  const row = await env.DB.prepare(
    'INSERT INTO clips (title, url, competition, recorded_on, published) VALUES (?, ?, ?, ?, ?) RETURNING *'
  ).bind(c.title, c.url, c.competition, c.recorded_on, c.published).first();
  return json({ clip: row }, 201);
}
