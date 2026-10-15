// GET /api/admin/results (all), POST /api/admin/results (create)
import { json } from '../../../lib/http.js';
import { validateResult } from '../../../lib/forms.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM results ORDER BY competition_date DESC, competition, athlete').all();
  return json({ results });
}

export async function onRequestPost({ request, env }) {
  const v = validateResult(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const r = v.result;
  const row = await env.DB.prepare(
    'INSERT INTO results (competition, competition_date, athlete, event_type, division, place, note, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(r.competition, r.competition_date, r.athlete, r.event_type, r.division, r.place, r.note, r.published).first();
  return json({ result: row }, 201);
}
