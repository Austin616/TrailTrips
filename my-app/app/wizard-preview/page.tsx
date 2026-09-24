'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TripWizard } from '@/components/trips/trip-wizard';
export default function Preview() { return <Dialog open><DialogContent className="trip-wizard-dialog"><TripWizard onSave={async () => { throw new Error('Preview: your trip was not saved.'); }}/></DialogContent></Dialog>; }
