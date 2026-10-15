// GET /api/clips: published training clips, newest first. ?competition= filters.
import { json } from '../../lib/http.js';

export async function onRequestGet({ request, env }) {
  const comp = new URL(request.url).searchParams.get('competition');
  const cols = 'id, title, url, competition, recorded_on';
  const q = comp
    ? env.DB.prepare(`SELECT ${cols} FROM clips WHERE published = 1 AND competition = ? ORDER BY COALESCE(recorded_on, created_at) DESC LIMIT 100`).bind(comp)
    : env.DB.prepare(`SELECT ${cols} FROM clips WHERE published = 1 ORDER BY COALESCE(recorded_on, created_at) DESC LIMIT 100`);
  const { results } = await q.all();
  return json({ clips: results }, 200, { 'Cache-Control': 'public, max-age=300' });
}
