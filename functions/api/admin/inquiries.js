// GET /api/admin/inquiries?status=&interest=&q=
import { json } from '../../../lib/http.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const where = [];
  const args = [];
  const status = url.searchParams.get('status');
  const interest = url.searchParams.get('interest');
  const q = (url.searchParams.get('q') || '').trim();
  if (status) { where.push('status = ?'); args.push(status); }
  if (interest) { where.push('interest = ?'); args.push(interest); }
  if (q) {
    where.push("(name || ' ' || email || ' ' || IFNULL(phone,'') || ' ' || message) LIKE ?");
    args.push(`%${q.replace(/[%_]/g, '')}%`);
  }
  const sql = `SELECT * FROM inquiries ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC LIMIT 1000`;
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  const counts = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status').all();
  return json({ inquiries: results, counts: Object.fromEntries(counts.results.map((c) => [c.status, c.n])) });
}
