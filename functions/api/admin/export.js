// GET /api/admin/export: all inquiries as a CSV spreadsheet.
import { csvCell } from '../../../lib/forms.js';

const COLS = ['id', 'created_at', 'status', 'name', 'email', 'phone', 'interest', 'message', 'referral', 'notes'];

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`SELECT ${COLS.join(', ')} FROM inquiries ORDER BY created_at DESC`).all();
  const csv = [COLS.join(','), ...results.map((r) => COLS.map((c) => csvCell(r[c])).join(','))].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="golden-shotokan-inquiries-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
