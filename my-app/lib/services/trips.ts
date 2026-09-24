import { getSupabase } from '@/lib/supabase/client';
import type { Trip, TripStop, LodgingLocation } from '@/lib/types';

type StopRow = { id: string; trail_id: string; created_at: string };
type DayRow = { id: string; date: string; title: string; trip_stops: StopRow[] };
type TripRow = { id: string; name: string; destination: string; start_date: string; end_date: string; photo: string; lodging: LodgingLocation; trip_days: DayRow[] };
function client() {
  const db = getSupabase();
  if (!db) throw new Error('Sign-in is not configured yet.');
  return db;
}
export function mapStop(row: StopRow): TripStop {
  return { id: row.id, trailId: row.trail_id, start: 'Unscheduled', finish: 'To be planned', driveMinutes: 0 };
}
export const tripService = {
  async list(userId: string): Promise<Trip[]> {
    const { data, error } = await client().from('trips').select('*, trip_days(*, trip_stops(*))').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data as TripRow[]).map(row => ({
      id: row.id, name: row.name, destination: row.destination, startDate: row.start_date, endDate: row.end_date, photo: row.photo, lodging: row.lodging,
      days: row.trip_days.sort((a, b) => a.date.localeCompare(b.date)).map(day => ({ id: day.id, date: day.date, title: day.title, stops: day.trip_stops.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)).map(mapStop) })),
    }));
  },
  async create(trip: Trip) {
    const { error } = await client().rpc('create_trip', { trip });
    if (error) throw error;
  },
  async addStop(dayId: string, trailId: string) {
    const { data, error } = await client().from('trip_stops').insert({ day_id: dayId, trail_id: trailId }).select().single();
    if (error) throw error;
    return mapStop(data);
  },
  async removeStop(dayId: string, stopId: string) {
    const { data, error } = await client().from('trip_stops').delete().eq('id', stopId).eq('day_id', dayId).select('id').single();
    if (error || !data) throw error ?? new Error('This stop could not be removed. Refresh and try again.');
  },
};
