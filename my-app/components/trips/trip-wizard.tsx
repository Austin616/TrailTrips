'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, CalendarDays, Mountain, Check, Hotel, Tent, Car, Compass, LoaderCircle, Pencil } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { photos } from '@/lib/data/mock';
import { dayCount, emptyDraft, tripFromDraft, validateStep, type TripDraft } from '@/lib/trip-draft';
import { errorMessage } from '@/lib/store';
import type { Trip } from '@/lib/types';

const steps = [
  { label: 'Destination', title: 'Where are we headed?', description: 'A favorite place. A new corner of the world. Start anywhere.', photo: photos.oregon, caption: 'Follow your curiosity.', note: 'Every great trip starts with a place.' },
  { label: 'Dates', title: 'Make time for outside.', description: 'A quick escape or a little longer. Give your adventure some dates.', photo: photos.washington, caption: 'Slow down. Look up.', note: 'A little space on the calendar goes a long way.' },
  { label: 'Basecamp', title: 'Find your home base.', description: 'Where will you start and end each day? Settle in somewhere good.', photo: photos.lake, caption: 'Stay close to wonder.', note: 'Your starting point for everything ahead.' },
  { label: 'Review', title: 'Your next chapter.', description: 'The essentials are here. The best details are still to come.', photo: photos.hero, caption: 'Let the adventure begin.', note: 'Less logistics. More out there.' },
];
const stays = [{ type: 'Hotel / Airbnb', label: 'A cozy stay', icon: Hotel }, { type: 'Campsite', label: 'Under the stars', icon: Tent }, { type: 'Car camping', label: 'On the road', icon: Car }, { type: 'Custom location', label: 'Somewhere else', icon: MapPin }] as const;
function prettyDate(date: string) { return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export function TripWizard({ onSave }: { onSave: (trip: Trip) => Promise<void> }) {
  const [draft, setDraft] = useState<TripDraft>({ ...emptyDraft });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const current = steps[step];
  function update<K extends keyof TripDraft>(key: K, value: TripDraft[K]) { setDraft(previous => ({ ...previous, [key]: value })); setError(null); }
  function go(next: number) { setDirection(next > step ? 1 : -1); setError(null); setStep(next); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    const message = validateStep(draft, step);
    if (message) { setError(message); return; }
    if (step < 3) { go(step + 1); return; }
    saving.current = true; setPending(true); setError(null);
    try { await onSave(tripFromDraft(draft)); }
    catch (error) { setError(errorMessage(error)); }
    finally { saving.current = false; setPending(false); }
  }
  return <div className="trip-wizard">
    <aside className="wizard-scenery" aria-hidden="true"><AnimatePresence mode="sync"><motion.img key={current.photo} src={current.photo} alt="" initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.7 }}/></AnimatePresence><div className="wizard-scenery-shade"/><span className="wizard-brand"><Mountain size={22}/>trailtrips.</span><div className="wizard-scenery-copy"><span>ROOM TO WANDER</span><h2>{current.caption}</h2><p>{current.note}</p><div className="scenery-dots">{steps.map((s, i) => <i key={s.label} className={i === step ? 'active' : ''}/>)}</div></div></aside>
    <div className="wizard-body"><div className="wizard-topline"><span>PLAN SOMETHING GOOD</span><span aria-live="polite">0{step + 1} / 04</span></div><ol className="wizard-progress" aria-label="Trip creation progress">{steps.map((s, i) => <li key={s.label} aria-current={i === step ? 'step' : undefined} className={i <= step ? 'reached' : ''}><span>{i < step ? <Check size={12}/> : i + 1}</span><small>{s.label}</small></li>)}</ol>
      <form onSubmit={submit} className="wizard-form"><fieldset disabled={pending}>
        <AnimatePresence mode="wait" custom={direction} initial={false}><motion.div key={step} custom={direction} variants={{ enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 26 }), center: { opacity: 1, x: 0 }, exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : -dir * 26 }) }} initial="enter" animate="center" exit="exit" transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} onAnimationComplete={() => heading.current?.focus()} className="wizard-slide">
          <DialogTitle ref={heading} tabIndex={-1} className="wizard-title">{current.title}</DialogTitle><DialogDescription className="wizard-description">{current.description}</DialogDescription>
          {step === 0 && <div className="wizard-fields"><label className="field">Trip name<input value={draft.name} onChange={e => update('name', e.target.value)} required maxLength={80} placeholder="A weekend chasing waterfalls" autoComplete="off"/></label><label className="field">Destination<div className="wizard-input-icon"><MapPin size={18}/><input value={draft.destination} onChange={e => update('destination', e.target.value)} required placeholder="City, region, or national park" autoComplete="off"/></div></label><div className="wizard-hint"><Compass size={17}/><p>No perfect plan required.<br/><span>You’ll add your favorite trails next.</span></p></div></div>}
          {step === 1 && <div className="wizard-fields"><div className="wizard-date-grid"><label className="field">First day<input type="date" value={draft.start} onChange={e => update('start', e.target.value)} required/></label><label className="field">Last day<input type="date" min={draft.start || undefined} value={draft.end} onChange={e => update('end', e.target.value)} required/></label></div><div className="wizard-date-note"><CalendarDays size={26}/><strong>{Number.isFinite(dayCount(draft)) && dayCount(draft) > 0 && dayCount(draft) <= 30 ? `${dayCount(draft)} ${dayCount(draft) === 1 ? 'day' : 'days'} of possibility` : 'A little room to explore'}</strong><span>Plan anywhere from 1 to 30 days.</span></div></div>}
          {step === 2 && <div className="wizard-fields"><div className="stay-options" role="group" aria-label="Basecamp type">{stays.map(stay => <button type="button" key={stay.type} aria-pressed={draft.type === stay.type} onClick={() => update('type', stay.type)} className={draft.type === stay.type ? 'selected' : ''}><stay.icon size={20}/><strong>{stay.type}</strong><span>{stay.label}</span>{draft.type === stay.type && <Check className="stay-check" size={13}/>}</button>)}</div><label className="field">Basecamp name or address<input value={draft.lodging} onChange={e => update('lodging', e.target.value)} required placeholder="Your cabin, campsite, or favorite little hotel" autoComplete="off"/></label></div>}
          {step === 3 && <div className="wizard-review"><div className="review-name"><Mountain size={24}/><div><small>YOUR NEXT ADVENTURE</small><h3>{draft.name}</h3></div></div>{[{ icon: MapPin, label: 'Destination', value: draft.destination, edit: 0 }, { icon: CalendarDays, label: `${dayCount(draft)} ${dayCount(draft) === 1 ? 'day' : 'days'}`, value: `${prettyDate(draft.start)} – ${prettyDate(draft.end)}`, edit: 1 }, { icon: stays.find(s => s.type === draft.type)!.icon, label: draft.type, value: draft.lodging, edit: 2 }].map(row => <div key={row.label} className="review-row"><row.icon size={18}/><div><small>{row.label}</small><strong>{row.value}</strong></div><button type="button" aria-label={`Edit ${row.label}`} onClick={() => go(row.edit)}><Pencil size={15}/></button></div>)}</div>}
        </motion.div></AnimatePresence>
        {error && <p role="alert" className="form-error wizard-error">{error}</p>}
        <div className="wizard-actions">{step > 0 ? <button type="button" className="wizard-back" onClick={() => go(step - 1)}><ArrowLeft size={16}/>Back</button> : <span className="wizard-footnote">A few details. Endless possibility.</span>}<Button type="submit" disabled={pending}>{pending ? <><LoaderCircle size={16} className="wizard-spinner"/>Creating…</> : step === 3 ? <>Create my trip <ArrowRight size={16}/></> : <>Continue <ArrowRight size={16}/></>}</Button></div>
      </fieldset></form><p className="wizard-private">Only you can see your trips.</p>
    </div>
  </div>;
}
