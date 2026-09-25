import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function CreateTripButton({ label = 'Create trip' }: { label?: string }) {
  return <Button asChild><Link href="/trips/new"><Plus size={16}/>{label}</Link></Button>;
}
