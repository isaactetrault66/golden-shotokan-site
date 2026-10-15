import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent } from '../lib/forms.js';

const base = { title: 'Fall kyu grading', kind: 'Grading', date: '2026-11-21', start_time: '10:00', end_time: '12:00' };

test('valid event passes and defaults to published', () => {
  const v = validateEvent(base);
  assert.equal(v.ok, true);
  assert.equal(v.event.published, 1);
  assert.equal(v.event.location, null);
});

test('hidden events stay hidden', () => {
  assert.equal(validateEvent({ ...base, published: false }).event.published, 0);
});

test('bad events are rejected', () => {
  assert.equal(validateEvent({ ...base, title: '' }).ok, false);
  assert.equal(validateEvent({ ...base, kind: 'Party' }).ok, false);
  assert.equal(validateEvent({ ...base, date: '2026-13-40' }).ok, false);
  assert.equal(validateEvent({ ...base, start_time: '12:00', end_time: '10:00' }).ok, false);
});
