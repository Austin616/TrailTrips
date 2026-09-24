'use client';
import Link from 'next/link';
import { ArrowUpRight, Star, Mountain, Clock, Route, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Trail } from '@/lib/types';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { SignInButton } from '@/components/auth/auth-gate';
import { errorMessage, usePlanner } from '@/lib/store';
export function AddToTrip({trail}:{trail:Trail}) {
  const {user}=useAuth();
  const trips=usePlanner(s=>s.trips);
  const loading=usePlanner(s=>s.loading);
  const loadError=usePlanner(s=>s.error);
  const load=usePlanner(s=>s.load);
  const add=usePlanner(s=>s.addTrail);
  const [tripId,setTripId]=useState('');
  const [dayId,setDayId]=useState('');
  const [added,setAdded]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const selected=trips.find(t=>t.id===tripId)??trips[0];
  const day=selected?.days.find(d=>d.id===dayId)??selected?.days[0];
  if(!user)return <SignInButton/>;
  return <Dialog onOpenChange={()=>{setAdded(false);setError(null)}}><DialogTrigger asChild><Button variant="outline" size="sm"><Plus size={14}/>Add to trip</Button></DialogTrigger><DialogContent><DialogTitle className="text-xl font-semibold">Make room for {trail.name}</DialogTitle><DialogDescription className="text-muted text-sm mt-2 mb-5">Choose a trip and day for this stop.</DialogDescription>{loading?<p role="status">Loading your trips…</p>:loadError?<div role="alert"><p>{loadError}</p><Button onClick={()=>void load()}>Try again</Button></div>:selected?<div className="space-y-4"><label className="field">Trip<select disabled={pending} value={selected.id} onChange={e=>{setTripId(e.target.value);setDayId('');setAdded(false)}}>{trips.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label className="field">Day<select disabled={pending} value={day?.id} onChange={e=>{setDayId(e.target.value);setAdded(false)}}>{selected.days.map((d,i)=><option key={d.id} value={d.id}>Day {i+1} · {d.date}</option>)}</select></label>{error&&<p className="form-error" role="alert">{error}</p>}<Button disabled={added||pending||!day} onClick={async()=>{if(!day||pending)return;setPending(true);setError(null);try{await add(selected.id,day.id,trail.id);setAdded(true)}catch(error){setError(errorMessage(error))}finally{setPending(false)}}}>{pending?'Saving…':added?<><Check size={16}/>Added to your itinerary</>:<><Plus size={16}/>Add stop</>}</Button>{added&&<Link className="block text-sm underline" href={`/trips/${selected.id}`}>Open trip planner</Link>}</div>:<Link href="/trips" className="text-link">Create your first trip</Link>}</DialogContent></Dialog>;
}
export function TrailStats({trail}:{trail:Trail}){return <div className="trail-stats"><span><Route size={14}/>{trail.distance} mi</span><span><Mountain size={14}/>{trail.elevation.toLocaleString()} ft</span><span><Clock size={14}/>{trail.duration}</span></div>}
export function TrailCard({trail}:{trail:Trail}){return <article className="trail-card"><Link href={`/trails/${trail.slug}`} className="trail-image"><img src={trail.photo} alt={trail.name}/><span className={`difficulty ${trail.difficulty.toLowerCase()}`}>{trail.difficulty}</span><span className="image-arrow"><ArrowUpRight size={18}/></span></Link><div className="trail-card-body"><p className="eyebrow location">{trail.location}</p><Link href={`/trails/${trail.slug}`}><h3>{trail.name}</h3></Link><div className="rating"><Star size={13} fill="currentColor"/>{trail.rating}<span>({trail.reviews.toLocaleString()} reviews)</span></div><TrailStats trail={trail}/><div className="card-bottom"><span>Worth the detour.</span><AddToTrip trail={trail}/></div></div></article>}
