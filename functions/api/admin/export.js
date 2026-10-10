// GET /api/admin/export: all registrations as a CSV spreadsheet.
import { csvCell } from '../../../lib/registration.js';

const COLS = [
  'id', 'created_at', 'status', 'student_first', 'student_last', 'dob', 'program', 'experience', 'family_members',
  'guardian_name', 'email', 'phone', 'city', 'start_date', 'preferred_class', 'referral', 'medical',
  'emergency_name', 'emergency_phone', 'waiver', 'photo_consent', 'notes',
];

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`SELECT ${COLS.join(', ')} FROM registrations ORDER BY created_at DESC`).all();
  const csv = [COLS.join(','), ...results.map((r) => COLS.map((c) => csvCell(r[c])).join(','))].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="golden-shotokan-registrations-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
