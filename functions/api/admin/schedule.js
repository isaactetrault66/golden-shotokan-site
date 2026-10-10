// PUT /api/admin/schedule  { classes: [{day,start,end,name}], notice }
import { json } from '../../../lib/http.js';
import { validateSchedule } from '../../../lib/registration.js';

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const v = validateSchedule(body.classes);
  if (!v.ok) return json({ error: v.error }, 400);
  const notice = String(body.notice ?? '').slice(0, 300);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM schedule'),
    ...v.classes.map((c, i) =>
      env.DB.prepare('INSERT INTO schedule (sort, day, start, end, name) VALUES (?, ?, ?, ?, ?)').bind(i, c.day, c.start, c.end, c.name)
    ),
    env.DB.prepare("INSERT INTO settings (key, value) VALUES ('schedule_notice', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(notice),
  ]);
  return json({ ok: true });
}
