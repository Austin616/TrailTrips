import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, validateStep, tripFromDraft } from '../lib/trip-draft';
test('wizard rejects missing fields and invalid durations before saving', () => {
  assert.ok(validateStep(emptyDraft, 0));
  assert.ok(validateStep({ ...emptyDraft, start: '2026-10-02', end: '2026-10-01' }, 1));
  assert.ok(validateStep({ ...emptyDraft, start: '2026-10-01', end: '2026-10-31' }, 1));
  assert.ok(validateStep(emptyDraft, 2));
  assert.throws(() => tripFromDraft(emptyDraft));
});
test('wizard creates inclusive days across month boundaries and keeps chosen lodging', () => {
  const trip = tripFromDraft({ name: '  Autumn escape ', destination: ' Oregon ', start: '2026-10-31', end: '2026-11-02', lodging: ' Creek campsite ', type: 'Campsite' });
  assert.equal(trip.name, 'Autumn escape');
  assert.equal(trip.destination, 'Oregon');
  assert.deepEqual(trip.days.map(day => day.date), ['2026-10-31', '2026-11-01', '2026-11-02']);
  assert.equal(new Set(trip.days.map(day => day.id)).size, 3);
  assert.equal(trip.lodging.type, 'Campsite');
  assert.equal(trip.lodging.name, 'Creek campsite');
  assert.ok(trip.days.every(day => day.stops.length === 0));
});
