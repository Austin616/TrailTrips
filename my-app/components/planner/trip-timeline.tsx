'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Trash2, Plus, Check, Search, LoaderCircle } from 'lucide-react';
import { trails } from '@/lib/data/mock';
import { errorMessage, usePlanner } from '@/lib/store';
import type { TripStop as Stop } from '@/lib/types';

export function TripStop({ stop, index, tripId, dayId, onShowMap }: { stop: Stop; index: number; tripId: string; dayId: string; onShowMap: () => void }) {
  const trail = trails.find(t => t.id === stop.trailId);
  const remove = usePlanner(s => s.removeStop);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!trail) return null;
  return <article className="itinerary-stop"><span className="itinerary-stop-number">{index + 1}</span><Link href={`/trails/${trail.slug}`} className="itinerary-stop-photo"><img src={trail.photo} alt={trail.name}/></Link><div className="itinerary-stop-copy"><span className={`difficulty inline-difficulty ${trail.difficulty.toLowerCase()}`}>{trail.difficulty}</span><Link href={`/trails/${trail.slug}`}><h3>{trail.name}</h3></Link><p>{trail.distance} mi <i>·</i> {trail.elevation.toLocaleString()} ft gain <i>·</i> {trail.duration}</p><a href="#day-map" onClick={onShowMap}><MapPin size={13}/>Show on map</a>{error && <p role="alert" className="form-error">{error}</p>}</div><button className="itinerary-remove" aria-label={`Remove ${trail.name}`} title="Remove trail" disabled={pending} onClick={async () => { setPending(true); setError(null); try { await remove(tripId, dayId, stop.id); } catch (error) { setError(errorMessage(error)); } finally { setPending(false); } }}>{pending ? <LoaderCircle className="wizard-spinner" size={16}/> : <Trash2 size={16}/>}</button></article>;
}
export function TrailPicker({ tripId, dayId }: { tripId: string; dayId: string }) {
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const add = usePlanner(s => s.addTrail);
  const filtered = trails.filter(t => `${t.name} ${t.location}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="inline-trail-picker" aria-label="Add a trail to this day"><label><Search size={17}/><input autoFocus aria-label="Find a trail for this day" placeholder="Find a trail…" value={search} onChange={e => setSearch(e.target.value)}/></label><div className="picker-results">{filtered.map(trail => <div className="picker-trail" key={trail.id}><img src={trail.photo} alt=""/><div><strong>{trail.name}</strong><span>{trail.distance} mi · {trail.difficulty}</span></div><button disabled={!!pending || added.includes(trail.id)} aria-label={`Add ${trail.name} to this day`} onClick={async () => { setPending(trail.id); setError(null); try { await add(tripId, dayId, trail.id); setAdded(previous => [...previous, trail.id]); } catch (error) { setError(errorMessage(error)); } finally { setPending(null); } }}>{pending === trail.id ? <LoaderCircle size={17} className="wizard-spinner"/> : added.includes(trail.id) ? <Check size={17}/> : <Plus size={17}/>}</button></div>)}{!filtered.length && <p>No matching trails. Try another name.</p>}</div>{error && <p role="alert" className="form-error">{error}</p>}</section>;
}
