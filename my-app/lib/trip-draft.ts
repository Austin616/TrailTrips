import type { LodgingLocation, Trip } from './types';
import { photos } from './data/mock';
export type TripDraft = { name: string; destination: string; start: string; end: string; lodging: string; type: LodgingLocation['type'] };
export const emptyDraft: TripDraft = { name: '', destination: '', start: '', end: '', lodging: '', type: 'Hotel / Airbnb' };
export function dayCount(draft: TripDraft) { return Math.round((Date.parse(draft.end) - Date.parse(draft.start)) / 86400000) + 1; }
export function validateStep(draft: TripDraft, step: number): string | null {
  if (step === 0 && (!draft.name.trim() || !draft.destination.trim())) return 'Give your trip a name and choose a destination.';
  if (step === 0 && draft.name.trim().length > 80) return 'Keep your trip name to 80 characters or fewer.';
  if (step === 1 && (!Number.isFinite(dayCount(draft)) || dayCount(draft) < 1 || dayCount(draft) > 30)) return 'Choose dates for a trip of 1 to 30 days.';
  if (step === 2 && !draft.lodging.trim()) return 'Add a name or address for your basecamp.';
  return null;
}
export function tripFromDraft(draft: TripDraft): Trip {
  for (let step = 0; step < 3; step++) { const error = validateStep(draft, step); if (error) throw new Error(error); }
  return { id: crypto.randomUUID(), name: draft.name.trim(), destination: draft.destination.trim(), startDate: draft.start, endDate: draft.end, photo: photos.lake, lodging: { name: draft.lodging.trim(), type: draft.type, coordinates: null }, days: Array.from({ length: dayCount(draft) }, (_, i) => ({ id: crypto.randomUUID(), date: new Date(Date.parse(draft.start) + i * 86400000).toISOString().slice(0, 10), title: 'A day to explore', stops: [] })) };
}
