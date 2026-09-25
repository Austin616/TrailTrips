'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Map, Plus, Mountain, Route, BedDouble, X } from 'lucide-react';
import { trails } from '@/lib/data/mock';
import { usePlanner } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { TripMap } from '@/components/map/trip-map';
import { TripStop, TrailPicker } from './trip-timeline';
import { Button } from '@/components/ui/button';
import type { Trip } from '@/lib/types';
import { AuthGate } from '@/components/auth/auth-gate';

export function Planner({ id }: { id: string }) { return <AuthGate><UserPlanner id={id}/></AuthGate>; }
function UserPlanner({ id }: { id: string }) {
  const { trips, loading, error, load } = usePlanner();
  const trip = trips.find(t => t.id === id);
  if (loading) return <main className="section page-main"><p role="status">Loading your trip…</p></main>;
  if (error) return <main className="section page-main"><p role="alert">{error}</p><Button onClick={() => void load()}>Try again</Button></main>;
  if (!trip) return <main className="section page-main"><div className="empty-state"><h1>This trip isn’t available.</h1><p>Choose a trip from your account or create a new adventure.</p><Button asChild><Link href="/trips">Back to my trips</Link></Button></div></main>;
  return <TripItinerary key={trip.id} trip={trip}/>;
}
export function TripItinerary({ trip }: { trip: Trip }) {
  const [index, setIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [picking, setPicking] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);
  const day = trip.days[index] ?? trip.days[0];
  if (!day) return <main className="section page-main"><p>This trip has no days yet.</p><Link href="/trips">Back to my trips</Link></main>;
  const selected = day.stops.flatMap(stop => { const trail = trails.find(t => t.id === stop.trailId); return trail ? [trail] : []; });
  const miles = selected.reduce((sum, trail) => sum + trail.distance, 0);
  const elevation = selected.reduce((sum, trail) => sum + trail.elevation, 0);
  return <main className="itinerary-page"><Link href="/trips" className="back-link"><ArrowLeft size={15}/>All trips</Link><header className="itinerary-heading"><div><p className="eyebrow">A LITTLE PLANNING. A LOT OF POSSIBILITY.</p><h1>{trip.name}</h1><div className="itinerary-meta"><span><MapPin size={15}/>{trip.destination}</span><span><CalendarDays size={15}/>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}, {trip.startDate.slice(0, 4)}</span></div></div><span className="account-saved"><i/>Saved to your account</span></header>
    <div className="itinerary-day-tabs" aria-label="Choose a trip day">{trip.days.map((d, i) => <button key={d.id} aria-pressed={i === index} className={i === index ? 'selected' : ''} onClick={() => { setIndex(i); setPicking(false); setSelectedTrail(null); }}><span>Day {i + 1}</span><strong>{formatDate(d.date)}</strong><small>{d.stops.length ? `${d.stops.length} ${d.stops.length === 1 ? 'stop' : 'stops'}` : 'Open day'}</small></button>)}</div>
    <div className="itinerary-content"><section className="itinerary-list"><div className="itinerary-day-heading"><div><p className="eyebrow">{new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</p><h2>Your day, your pace.</h2></div><Button size="sm" onClick={() => setPicking(!picking)}>{picking ? <><X size={15}/>Close</> : <><Plus size={15}/>Add a trail</>}</Button></div>
      {picking && <TrailPicker key={day.id} tripId={trip.id} dayId={day.id}/>}
      <div className="itinerary-basecamp"><span><BedDouble size={21}/></span><div><small>START & END HERE</small><strong>{trip.lodging.name}</strong><p>{trip.lodging.type}</p></div></div>
      {day.stops.length ? <ol className="itinerary-stops">{day.stops.map((stop, i) => <li key={stop.id}><TripStop stop={stop} index={i} tripId={trip.id} dayId={day.id} onShowMap={() => { setSelectedTrail(stop.trailId); setShowMap(true); }}/></li>)}</ol> : <div className="itinerary-empty"><span><Mountain size={30}/></span><h3>A whole day of possibilities.</h3><p>Find a trail you love and add it here.<br/>We’ll keep your stops together.</p><Button variant="outline" onClick={() => setPicking(true)}><Plus size={16}/>Find your first trail</Button></div>}
      {day.stops.length > 0 && <button className="itinerary-add-more" onClick={() => setPicking(true)}><Plus size={17}/>Add another trail</button>}
    </section><aside className="itinerary-aside"><section className="itinerary-summary"><h3>Day {index + 1} at a glance</h3><div><span>Trail stops</span><strong>{day.stops.length}</strong></div><div><span><Route size={15}/>Total hiking</span><strong>{miles.toFixed(1)} mi</strong></div><div><span><Mountain size={15}/>Elevation gain</span><strong>{elevation.toLocaleString()} ft</strong></div><p>Trail distances are from our sample collection.</p><button aria-expanded={showMap} aria-controls="day-map" onClick={() => setShowMap(!showMap)}><Map size={17}/>{showMap ? 'Hide day map' : 'Show day map'}</button></section><p className="itinerary-tip">Start with the trails you can’t miss.<br/>Leave a little room for the unexpected.</p></aside></div>
    {showMap && <section id="day-map" className="itinerary-map-section"><div><h2>Your day on the map</h2><button onClick={() => setShowMap(false)} aria-label="Close day map"><X size={19}/></button></div><div className="itinerary-real-map"><TripMap trails={selected} selectedTrailId={selectedTrail}/></div></section>}
  </main>;
}
