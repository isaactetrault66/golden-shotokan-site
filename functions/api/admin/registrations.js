// GET /api/admin/registrations?status=&program=&q=
import { json } from '../../../lib/http.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const where = [];
  const args = [];
  const status = url.searchParams.get('status');
  const program = url.searchParams.get('program');
  const q = (url.searchParams.get('q') || '').trim();
  if (status) { where.push('status = ?'); args.push(status); }
  if (program) { where.push('program = ?'); args.push(program); }
  if (q) {
    where.push("(student_first || ' ' || student_last || ' ' || IFNULL(guardian_name,'') || ' ' || email || ' ' || phone) LIKE ?");
    args.push(`%${q.replace(/[%_]/g, '')}%`);
  }
  const sql = `SELECT * FROM registrations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC LIMIT 1000`;
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  const counts = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM registrations GROUP BY status').all();
  return json({ registrations: results, counts: Object.fromEntries(counts.results.map((c) => [c.status, c.n])) });
}
