// GET /api/schedule: public class times and notice, edited in the admin area.
import { json } from '../../lib/http.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT day, start, end, name FROM schedule ORDER BY sort, id').all();
  const notice = await env.DB.prepare("SELECT value FROM settings WHERE key = 'schedule_notice'").first('value');
  return json({ classes: results, notice: notice || '' }, 200, { 'Cache-Control': 'public, max-age=300' });
}
