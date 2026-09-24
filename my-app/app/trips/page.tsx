'use client';
import { useSyncExternalStore } from 'react';
import { usePlanner } from '@/lib/store';
import { trips as mockTrips } from '@/lib/data/mock';
import { TripCard } from '@/components/trips/trip-card';
import { CreateTripDialog } from '@/components/trips/create-trip-dialog';
const subscribe=()=>()=>{};
export default function TripsPage(){const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);const saved=usePlanner(s=>s.trips);const trips=mounted?saved:mockTrips;return <main className="section page-main"><div className="section-heading"><div><p className="eyebrow">YOUR ADVENTURES, ALL TOGETHER</p><h1>Good things on the horizon.</h1><p>Dream a little. Plan a little. Get out there.</p></div><CreateTripDialog/></div><div className="flex gap-6 border-b border-stone-200 mb-8"><span className="border-b-2 border-forest pb-4 text-sm font-medium">All trips <span className="ml-2 rounded bg-stone-100 px-2 py-1 text-xs">{trips.length}</span></span><span className="text-xs text-muted pt-1">Saved on this device</span></div><div className="trail-grid">{trips.map(t=><TripCard trip={t} key={t.id}/>)}</div></main>}
