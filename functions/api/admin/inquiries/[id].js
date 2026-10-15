// PATCH /api/admin/inquiries/:id  { status?, notes? }
// DELETE /api/admin/inquiries/:id  (privacy deletion requests)
import { json } from '../../../../lib/http.js';
import { STATUSES } from '../../../../lib/forms.js';

export async function onRequestPatch({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  const body = await request.json().catch(() => ({}));
  const sets = [];
  const args = [];
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return json({ error: 'Unknown status' }, 400);
    sets.push('status = ?'); args.push(body.status);
  }
  if (body.notes !== undefined) {
    sets.push('notes = ?'); args.push(String(body.notes).slice(0, 4000));
  }
  if (!sets.length) return json({ error: 'Nothing to update' }, 400);
  sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')");
  const row = await env.DB.prepare(`UPDATE inquiries SET ${sets.join(', ')} WHERE id = ? RETURNING *`).bind(...args, id).first();
  if (!row) return json({ error: 'Not found' }, 404);
  return json({ inquiry: row });
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id' }, 400);
  await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
