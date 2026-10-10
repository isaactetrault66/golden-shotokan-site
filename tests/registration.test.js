import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, ageOn, csvCell, validateSchedule } from '../lib/registration.js';

const today = new Date('2026-10-10T12:00:00Z');
const base = {
  student_first: 'Aiko', student_last: 'Tanaka', dob: '2000-05-01', email: 'aiko@example.com',
  phone: '250-555-0101', emergency_name: 'Ken Tanaka', emergency_phone: '250-555-0102', waiver: 'yes',
};

test('valid adult registration passes', () => {
  const r = validateRegistration(base, today);
  assert.equal(r.ok, true);
  assert.equal(r.data.age, 26);
  assert.equal(r.data.photo_consent, 0);
});

test('minor needs a guardian', () => {
  const r = validateRegistration({ ...base, dob: '2016-01-01' }, today);
  assert.equal(r.ok, false);
  assert.match(r.error, /guardian/);
  assert.equal(validateRegistration({ ...base, dob: '2016-01-01', guardian_name: 'Ken Tanaka' }, today).ok, true);
});

test('missing required fields and waiver are rejected', () => {
  assert.equal(validateRegistration({ ...base, email: '' }, today).ok, false);
  assert.equal(validateRegistration({ ...base, email: 'nope' }, today).ok, false);
  assert.equal(validateRegistration({ ...base, waiver: '' }, today).ok, false);
});

test('honeypot marks spam', () => {
  const r = validateRegistration({ ...base, website: 'http://spam' }, today);
  assert.equal(r.ok, false);
  assert.equal(r.spam, true);
});

test('overlong input rejected', () => {
  assert.equal(validateRegistration({ ...base, medical: 'x'.repeat(1001) }, today).ok, false);
});

test('age calculation around birthday', () => {
  assert.equal(ageOn('2010-10-10', today), 16);
  assert.equal(ageOn('2010-10-11', today), 15);
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
