'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trips } from '@/lib/data/mock';
import type { Trip } from '@/lib/types';
type PlannerState = { trips: Trip[]; createTrip: (trip: Trip) => void; addTrail: (tripId: string, dayId: string, trailId: string) => void; removeStop: (tripId: string, dayId: string, stopId: string) => void };
export const usePlanner = create<PlannerState>()(persist((set)=>({trips,createTrip:trip=>set(s=>({trips:[trip,...s.trips]})),addTrail:(tripId,dayId,trailId)=>set(s=>({trips:s.trips.map(t=>t.id!==tripId?t:{...t,days:t.days.map(d=>d.id!==dayId?d:{...d,stops:[...d.stops,{id:crypto.randomUUID(),trailId,start:'Unscheduled',finish:'To be planned',driveMinutes:0}]})})})),removeStop:(tripId,dayId,stopId)=>set(s=>({trips:s.trips.map(t=>t.id!==tripId?t:{...t,days:t.days.map(d=>d.id!==dayId?d:{...d,stops:d.stops.filter(x=>x.id!==stopId)})})}))}),{name:'trailtrips-planner-v1'}));
