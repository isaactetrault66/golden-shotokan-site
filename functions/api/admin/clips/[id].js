// PUT /api/admin/clips/:id (replace), DELETE /api/admin/clips/:id
import { json } from '../../../../lib/http.js';
import { validateClip } from '../../../../lib/forms.js';

export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  const v = validateClip(await request.json().catch(() => ({})));
  if (!v.ok) return json({ error: v.error }, 400);
  const c = v.clip;
  const row = await env.DB.prepare(
    'UPDATE clips SET title = ?, url = ?, competition = ?, recorded_on = ?, published = ? WHERE id = ? RETURNING *'
  ).bind(c.title, c.url, c.competition, c.recorded_on, c.published, id).first();
  if (!row) return json({ error: 'Not found' }, 404);
  return json({ clip: row });
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  await env.DB.prepare('DELETE FROM clips WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
