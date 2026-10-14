// GET /api/admin/events (all), POST /api/admin/events (create)
import { json } from '../../../lib/http.js';
import { validateEvent } from '../../../lib/forms.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM events ORDER BY date DESC, start_time').all();
  return json({ events: results });
}

export async function onRequestPost({ request, env }) {
  const v = validateEvent(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const e = v.event;
  const row = await env.DB.prepare(
    'INSERT INTO events (title, kind, date, start_time, end_time, location, description, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(e.title, e.kind, e.date, e.start_time, e.end_time, e.location, e.description, e.published).first();
  return json({ event: row }, 201);
}
