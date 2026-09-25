'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { TripWizard } from '@/components/trips/trip-wizard';
import { usePlanner } from '@/lib/store';
export default function CreateTripPage() {
  const create = usePlanner(s => s.createTrip);
  const router = useRouter();
  return <AuthGate><main className="create-page"><Link className="back-link" href="/trips"><ArrowLeft size={15}/>My trips</Link><div className="create-page-card"><TripWizard onSave={async trip => { await create(trip); router.push(`/trips/${trip.id}`); }}/></div></main></AuthGate>;
}
