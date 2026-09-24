import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { formatDate } from '@/lib/utils';
export function TripCard({trip}:{trip:Trip}){return <Link href={`/trips/${trip.id}`} className="trip-card"><div className="trip-image"><img src={trip.photo} alt={trip.destination}/><span className="image-arrow"><ArrowUpRight size={19}/></span><span className="trip-days">{trip.days.length} days outside</span></div><div className="p-5"><p className="text-xs text-muted flex items-center gap-1"><MapPin size={12}/>{trip.destination}</p><h3 className="text-xl font-semibold mt-2 mb-3">{trip.name}</h3><div className="flex items-center justify-between text-xs text-muted"><span className="flex items-center gap-1.5"><CalendarDays size={14}/>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span><span>{trip.days.reduce((sum,d)=>sum+d.stops.length,0)} planned hikes</span></div></div></Link>}
