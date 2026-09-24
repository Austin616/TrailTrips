'use client';
import { create } from 'zustand';
import { tripService } from '@/lib/services/trips';
import type { Trip } from '@/lib/types';

type PlannerState = {
  userId: string | null; trips: Trip[]; loading: boolean; error: string | null;
  reset: (userId: string | null) => void;
  load: () => Promise<void>;
  createTrip: (trip: Trip) => Promise<void>;
  addTrail: (tripId: string, dayId: string, trailId: string) => Promise<void>;
  removeStop: (tripId: string, dayId: string, stopId: string) => Promise<void>;
};
export function errorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Something went wrong. Please try again.';
}
let generation = 0;
export const usePlanner = create<PlannerState>((set, get) => ({
  userId: null, trips: [], loading: false, error: null,
  reset: userId => { generation++; set({ userId, trips: [], loading: !!userId, error: null }); },
  load: async () => {
    const { userId } = get();
    const request = generation;
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const trips = await tripService.list(userId);
      if (generation === request) set({ trips, loading: false });
    } catch (error) { if (generation === request) set({ error: errorMessage(error), loading: false }); }
  },
  createTrip: async trip => {
    if (!get().userId) throw new Error('Sign in to get started');
    const request = generation;
    await tripService.create(trip);
    if (generation !== request) throw new Error('Your account changed. Please try again.');
    set(s => ({ trips: [trip, ...s.trips] }));
  },
  addTrail: async (tripId, dayId, trailId) => {
    if (!get().userId) throw new Error('Sign in to get started');
    const request = generation;
    const stop = await tripService.addStop(dayId, trailId);
    if (generation !== request) throw new Error('Your account changed. Please try again.');
    set(s => ({ trips: s.trips.map(t => t.id !== tripId ? t : { ...t, days: t.days.map(d => d.id !== dayId ? d : { ...d, stops: [...d.stops, stop] }) }) }));
  },
  removeStop: async (tripId, dayId, stopId) => {
    if (!get().userId) throw new Error('Sign in to get started');
    const request = generation;
    await tripService.removeStop(dayId, stopId);
    if (generation !== request) return;
    set(s => ({ trips: s.trips.map(t => t.id !== tripId ? t : { ...t, days: t.days.map(d => d.id !== dayId ? d : { ...d, stops: d.stops.filter(x => x.id !== stopId) }) }) }));
  },
}));
