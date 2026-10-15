import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry, csvCell, validateSchedule } from '../lib/forms.js';

const base = { name: 'Aiko Tanaka', email: 'aiko@example.com', message: 'Can my 14 year old and I join?' };

test('valid inquiry passes, phone optional', () => {
  const r = validateInquiry(base);
  assert.equal(r.ok, true);
  assert.equal(r.data.phone, null);
  assert.equal(validateInquiry({ ...base, phone: '250-555-0101', interest: 'Family' }).data.interest, 'Family');
});

test('missing or invalid required fields are rejected', () => {
  assert.equal(validateInquiry({ ...base, name: '' }).ok, false);
  assert.equal(validateInquiry({ ...base, email: 'nope' }).ok, false);
  assert.equal(validateInquiry({ ...base, message: '  ' }).ok, false);
  assert.equal(validateInquiry({ ...base, phone: '12' }).ok, false);
});

test('unknown interest is dropped', () => {
  assert.equal(validateInquiry({ ...base, interest: 'Kids' }).data.interest, null);
  assert.equal(validateInquiry({ ...base, interest: 'Open training' }).data.interest, 'Open training');
});

test('honeypot marks spam', () => {
  const r = validateInquiry({ ...base, website: 'http://spam' });
  assert.equal(r.ok, false);
  assert.equal(r.spam, true);
});

test('overlong input rejected', () => {
  assert.equal(validateInquiry({ ...base, message: 'x'.repeat(2001) }).ok, false);
});

test('csv cells are quoted and formula-safe', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvCell(null), '');
});

test('schedule validation', () => {
  assert.equal(validateSchedule([{ day: 'Monday', start: '18:00', end: '19:30', name: 'All ages' }]).ok, true);
  assert.equal(validateSchedule([{ day: 'Monday', start: '19:30', end: '18:00', name: 'x' }]).ok, false);
  assert.equal(validateSchedule([{ day: 'Funday', start: '18:00', end: '19:30', name: 'x' }]).ok, false);
});
