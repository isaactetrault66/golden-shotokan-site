// PUT /api/admin/results/:id (replace), DELETE /api/admin/results/:id
import { json } from '../../../../lib/http.js';
import { validateResult } from '../../../../lib/forms.js';

export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  const v = validateResult(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const r = v.result;
  const row = await env.DB.prepare(
    'UPDATE results SET competition = ?, competition_date = ?, athlete = ?, event_type = ?, division = ?, place = ?, note = ?, published = ? WHERE id = ? RETURNING *'
  ).bind(r.competition, r.competition_date, r.athlete, r.event_type, r.division, r.place, r.note, r.published, id).first();
  if (!row) return json({ error: 'Not found' }, 404);
  return json({ result: row });
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  await env.DB.prepare('DELETE FROM results WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
