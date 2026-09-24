'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePlanner } from '@/lib/store';
import { useAuth } from '@/components/auth/auth-provider';
import { SignInButton } from '@/components/auth/auth-gate';
import { TripWizard } from './trip-wizard';
export function CreateTripDialog({ label = 'Create trip' }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const create = usePlanner(s => s.createTrip);
  const { user } = useAuth();
  if (!user) return <SignInButton/>;
  return <Dialog open={open} onOpenChange={value => { if (!pending) setOpen(value); }}><DialogTrigger asChild><Button><Plus size={16}/>{label}</Button></DialogTrigger><DialogContent className="trip-wizard-dialog"><TripWizard onSave={async trip => { setPending(true); try { await create(trip); setOpen(false); router.push(`/trips/${trip.id}`); } finally { setPending(false); } }}/></DialogContent></Dialog>;
}
