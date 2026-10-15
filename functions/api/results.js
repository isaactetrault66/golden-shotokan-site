// GET /api/results: published tournament results, newest tournament first. ?competition= filters.
import { json } from '../../lib/http.js';

export async function onRequestGet({ request, env }) {
  const comp = new URL(request.url).searchParams.get('competition');
  const cols = 'id, competition, competition_date, athlete, event_type, division, place, note';
  const order = "ORDER BY competition_date DESC, competition, CASE place WHEN '1st' THEN 1 WHEN '2nd' THEN 2 WHEN '3rd' THEN 3 WHEN '4th' THEN 4 WHEN 'Finalist' THEN 5 ELSE 6 END, athlete";
  const q = comp
    ? env.DB.prepare(`SELECT ${cols} FROM results WHERE published = 1 AND competition = ? ${order} LIMIT 500`).bind(comp)
    : env.DB.prepare(`SELECT ${cols} FROM results WHERE published = 1 ${order} LIMIT 500`);
  const { results } = await q.all();
  return json({ results }, 200, { 'Cache-Control': 'public, max-age=300' });
}
