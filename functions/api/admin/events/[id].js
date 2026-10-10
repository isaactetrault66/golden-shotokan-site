// PUT /api/admin/events/:id (replace), DELETE /api/admin/events/:id
import { json } from '../../../../lib/http.js';
import { validateEvent } from '../../../../lib/registration.js';

export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  const v = validateEvent(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const e = v.event;
  const row = await env.DB.prepare(
    'UPDATE events SET title = ?, kind = ?, date = ?, start_time = ?, end_time = ?, location = ?, description = ?, published = ? WHERE id = ? RETURNING *'
  ).bind(e.title, e.kind, e.date, e.start_time, e.end_time, e.location, e.description, e.published, id).first();
  if (!row) return json({ error: 'Not found' }, 404);
  return json({ event: row });
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
