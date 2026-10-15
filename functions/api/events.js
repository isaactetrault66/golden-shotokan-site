// GET /api/events: published upcoming events, plus past events from the last two years.
import { json } from '../../lib/http.js';

export async function onRequestGet({ env }) {
  // Today's date in Golden, BC (Mountain time, UTC-6 or UTC-7; UTC-6 is close enough for picking the date).
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const cols = 'id, title, kind, date, start_time, end_time, location, description';
  const upcoming = await env.DB.prepare(`SELECT ${cols} FROM events WHERE published = 1 AND date >= ? ORDER BY date, start_time LIMIT 50`).bind(today).all();
  const since = new Date(Date.parse(today) - 730 * 86400_000).toISOString().slice(0, 10);
  const past = await env.DB.prepare(`SELECT ${cols} FROM events WHERE published = 1 AND date < ? AND date >= ? AND kind != 'Closure' ORDER BY date DESC LIMIT 30`).bind(today, since).all();
  return json({ upcoming: upcoming.results, past: past.results }, 200, { 'Cache-Control': 'public, max-age=300' });
}
