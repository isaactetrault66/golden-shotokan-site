import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoUrl, validateClip, validateResult } from '../lib/forms.js';

test('video links are recognised', () => {
  assert.deepEqual(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), { kind: 'youtube', id: 'dQw4w9WgXcQ' });
  assert.deepEqual(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ'), { kind: 'youtube', id: 'dQw4w9WgXcQ' });
  assert.deepEqual(parseVideoUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), { kind: 'youtube', id: 'dQw4w9WgXcQ' });
  assert.deepEqual(parseVideoUrl('https://vimeo.com/123456789'), { kind: 'vimeo', id: '123456789' });
  assert.equal(parseVideoUrl('https://example.com/clip.mp4').kind, 'file');
  assert.equal(parseVideoUrl('http://youtu.be/dQw4w9WgXcQ'), null);
  assert.equal(parseVideoUrl('javascript:alert(1)'), null);
  assert.equal(parseVideoUrl('https://example.com/page'), null);
});

test('clips need a title and a playable link', () => {
  const base = { title: 'Kata practice', url: 'https://youtu.be/dQw4w9WgXcQ', competition: '2026 ISKF World Shoto Cup' };
  assert.equal(validateClip(base).ok, true);
  assert.equal(validateClip({ ...base, title: '' }).ok, false);
  assert.equal(validateClip({ ...base, url: 'https://example.com' }).ok, false);
  assert.equal(validateClip({ ...base, recorded_on: '2026-02-31' }).ok, false);
});

test('results need a tournament, athlete, event and placing', () => {
  const base = { competition: '2026 ISKF World Shoto Cup', competition_date: '2026-10-25', athlete: 'Tyler Tetrault', event_type: 'Kata', place: '1st' };
  assert.equal(validateResult(base).ok, true);
  assert.equal(validateResult({ ...base, athlete: '' }).ok, false);
  assert.equal(validateResult({ ...base, place: 'Gold' }).ok, false);
  assert.equal(validateResult({ ...base, event_type: 'Sparring' }).ok, false);
  assert.equal(validateResult({ ...base, competition_date: '' }).ok, false);
  assert.equal(validateResult({ ...base, competition_date: '2026-13-40' }).ok, false);
});
