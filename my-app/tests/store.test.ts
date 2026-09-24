import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usePlanner } from '../lib/store';
import { tripService } from '../lib/services/trips';
import type { Trip } from '../lib/types';
const trip: Trip = { id: 'trip', name: 'Private', destination: 'Oregon', startDate: '2026-10-01', endDate: '2026-10-01', photo: '', lodging: { name: 'Basecamp', type: 'Campsite', coordinates: null }, days: [{ id: 'day', date: '2026-10-01', title: 'Explore', stops: [] }] };

test('switching accounts discards late loads and failed saves never change local data', async () => {
  const originalList = tripService.list;
  const originalCreate = tripService.create;
  const originalAdd = tripService.addStop;
  try {
    let finish!: (trips: Trip[]) => void;
    tripService.list = () => new Promise(resolve => { finish = resolve; });
    usePlanner.getState().reset('alice');
    const pending = usePlanner.getState().load();
    usePlanner.getState().reset('bob');
    finish([trip]); await pending;
    assert.deepEqual(usePlanner.getState().trips, []);
    tripService.create = async () => { throw new Error('Offline'); };
    await assert.rejects(usePlanner.getState().createTrip(trip), /Offline/);
    assert.deepEqual(usePlanner.getState().trips, []);
    tripService.create = async () => {};
    await usePlanner.getState().createTrip(trip);
    tripService.addStop = async () => { throw new Error('Offline'); };
    await assert.rejects(usePlanner.getState().addTrail('trip', 'day', 'wahclella-falls'), /Offline/);
    assert.deepEqual(usePlanner.getState().trips[0].days[0].stops, []);
    usePlanner.getState().reset(null);
    assert.deepEqual(usePlanner.getState().trips, []);
    await assert.rejects(usePlanner.getState().createTrip(trip), /Sign in/);
  } finally { tripService.list = originalList; tripService.create = originalCreate; tripService.addStop = originalAdd; usePlanner.getState().reset(null); }
});
