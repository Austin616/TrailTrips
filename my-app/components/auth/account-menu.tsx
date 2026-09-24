'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Compass, LogOut, Route, UserRound, ShieldCheck } from 'lucide-react';
import { useAuth } from './auth-provider';
import { SignInButton } from './auth-gate';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [pending, setPending] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  if (!user) return <SignInButton/>;
  const name = String(user.user_metadata.full_name || user.email?.split('@')[0] || 'Explorer');
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <div className="account-menu" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} className="profile-trigger" aria-label="Open account menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span className="profile-initials">{initials}</span><ChevronDown size={14} className={open ? 'turned' : ''}/></button>
    {open && <div id={id} className="profile-popover"><div className="profile-identity"><strong>{name}</strong><span>{user.email}</span></div><nav aria-label="Account"><button onClick={() => { setOpen(false); setProfile(true); }}><UserRound size={17}/>Your profile</button><Link href="/trips" onClick={() => setOpen(false)}><Route size={17}/>My trips</Link><Link href="/explore" onClick={() => setOpen(false)}><Compass size={17}/>Explore trails</Link></nav><button className="profile-signout" disabled={pending} onClick={async () => { setPending(true); try { await signOut(); setOpen(false); } finally { setPending(false); } }}><LogOut size={17}/>{pending ? 'Signing out…' : 'Sign out'}</button></div>}
    <Dialog open={profile} onOpenChange={setProfile}><DialogContent className="profile-dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}><span className="profile-initials profile-large">{initials}</span><DialogTitle className="text-2xl font-semibold mt-5">Your profile</DialogTitle><DialogDescription className="text-sm text-muted mt-2">Your home for a little more adventure.</DialogDescription><dl className="profile-facts"><div><dt>Name</dt><dd>{name}</dd></div><div><dt>Email</dt><dd>{user.email || 'Not provided'}</dd></div><div><dt>Sign-in method</dt><dd><ShieldCheck size={16}/>Google account</dd></div></dl><p className="text-xs text-muted">Your name and email come from your Google account. Your trips are saved privately to this account.</p><Link className="text-link mt-6 inline-flex" href="/trips" onClick={() => setProfile(false)}>View my trips <Route size={16}/></Link></DialogContent></Dialog>
  </div>;
}
