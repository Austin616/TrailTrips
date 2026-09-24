import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const alice = '00000000-0000-0000-0000-000000000001';
const bob = '00000000-0000-0000-0000-000000000002';
const tripId = '00000000-0000-0000-0000-000000000003';
const dayId = '00000000-0000-0000-0000-000000000004';
const trip = { id: tripId, name: 'My trip', destination: 'Oregon', startDate: '2026-10-01', endDate: '2026-10-01', photo: 'sample.jpg', lodging: { name: 'Basecamp', type: 'Campsite', coordinates: null }, days: [{ id: dayId, date: '2026-10-01', title: 'Explore', stops: [] }] };

test('migration enforces account isolation and creates trips atomically', async () => {
  const db = new PGlite();
  try {
    // Minimal Supabase auth contract; execute the actual production migration unchanged.
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users values ('${alice}'), ('${bob}');`);
    await db.exec(await readFile('supabase/migrations/202609240001_user_trips.sql', 'utf8'));
    const asUser = async (id: string) => {
      await db.exec('reset role; set role authenticated');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };
    const rows = async (table: string) => (await db.query(`select * from public.${table}`)).rows;
    await asUser(alice);
    await db.query('select public.create_trip($1::jsonb)', [JSON.stringify(trip)]);
    assert.equal((await rows('trips')).length, 1);
    assert.equal((await rows('trip_days')).length, 1);
    const stop = await db.query<{id:string}>('insert into public.trip_stops(day_id, trail_id) values ($1, $2) returning id', [dayId, 'wahclella-falls']);
    await asUser(bob);
    for (const table of ['trips', 'trip_days', 'trip_stops']) assert.equal((await rows(table)).length, 0, `${table} must be private`);
    await assert.rejects(db.query('insert into public.trip_stops(day_id, trail_id) values ($1, $2)', [dayId, 'wahclella-falls']), /row-level security/);
    await assert.rejects(db.query('insert into public.trip_days(trip_id, date, title) values ($1, $2, $3)', [tripId, '2026-10-02', 'Intrusion']), /row-level security/);
    assert.equal((await db.query('delete from public.trip_stops where id = $1 returning id', [stop.rows[0].id])).rows.length, 0);
    assert.equal((await db.query("update public.trips set name = 'Intrusion' where id = $1 returning id", [tripId])).rows.length, 0);
    await asUser(alice);
    await assert.rejects(db.query('update public.trips set user_id = $1 where id = $2', [bob, tripId]), /row-level security/);
    assert.equal((await rows('trip_stops')).length, 1);
    await db.query('delete from public.trip_stops where id = $1', [stop.rows[0].id]);
    assert.equal((await rows('trip_stops')).length, 0);
    const invalid = { ...trip, id: '00000000-0000-0000-0000-000000000005', days: [{ ...trip.days[0], date: '2026-11-01' }] };
    await assert.rejects(db.query('select public.create_trip($1::jsonb)', [JSON.stringify(invalid)]), /Day outside/);
    assert.equal((await rows('trips')).length, 1, 'invalid creation must roll back');
    await db.exec('reset role; set role anon');
    for (const table of ['trips', 'trip_days', 'trip_stops']) await assert.rejects(rows(table), /permission denied/);
    await assert.rejects(db.query('select public.create_trip($1::jsonb)', [JSON.stringify(trip)]), /permission denied/);
  } finally { await db.close(); }
});
