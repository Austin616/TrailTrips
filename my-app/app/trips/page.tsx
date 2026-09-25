'use client';
import { usePlanner } from '@/lib/store';
import { TripCard } from '@/components/trips/trip-card';
import { CreateTripButton } from '@/components/trips/create-trip-button';
import { AuthGate } from '@/components/auth/auth-gate';
import { Button } from '@/components/ui/button';
function UserTrips() {
  const { trips, loading, error, load } = usePlanner();
  return <main className="section page-main"><div className="section-heading"><div><p className="eyebrow">YOUR ADVENTURES, ALL TOGETHER</p><h1>Good things on the horizon.</h1><p>Dream a little. Plan a little. Get out there.</p></div><CreateTripButton/></div><div className="flex gap-6 border-b border-stone-200 mb-8"><span className="border-b-2 border-forest pb-4 text-sm font-medium">All trips <span className="ml-2 rounded bg-stone-100 px-2 py-1 text-xs">{trips.length}</span></span><span className="text-xs text-muted pt-1">Saved to your account</span></div>{loading ? <p role="status">Loading your trips…</p> : error ? <div role="alert"><p>{error}</p><Button onClick={() => void load()}>Try again</Button></div> : trips.length ? <div className="trail-grid">{trips.map(t => <TripCard trip={t} key={t.id}/>)}</div> : <div className="empty-state"><h2>Your first adventure is waiting.</h2><p>Create a trip, choose your basecamp, and start adding trails.</p><CreateTripButton label="Plan your first trip"/></div>}</main>;
}
export default function TripsPage() { return <AuthGate><UserTrips/></AuthGate>; }
