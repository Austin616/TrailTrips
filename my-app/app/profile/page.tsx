'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldCheck, Route, LogOut, Compass } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { useAuth } from '@/components/auth/auth-provider';
import { usePlanner } from '@/lib/store';
import { Button } from '@/components/ui/button';
function Profile() {
  const { user, signOut } = useAuth();
  const { trips, loading, error, load } = usePlanner();
  const [pending, setPending] = useState(false);
  if (!user) return null;
  const name = String(user.user_metadata.full_name || user.email?.split('@')[0] || 'Explorer');
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <main className="profile-page"><Link href="/" className="back-link"><ArrowLeft size={15}/>Home</Link><header className="profile-page-heading"><span className="profile-initials profile-large">{initials}</span><div><p className="eyebrow">YOUR LITTLE CORNER OF OUTSIDE</p><h1>{name}</h1><p>Your account. Your adventures.</p></div></header><div className="profile-page-grid"><section className="account-card"><h2>Account details</h2><p>The essentials, all in one place.</p><dl className="profile-facts"><div><dt>Name</dt><dd>{name}</dd></div><div><dt>Email</dt><dd>{user.email || 'Not provided'}</dd></div><div><dt>Connected account</dt><dd><ShieldCheck size={17}/>Google</dd></div></dl><p className="account-note">Your name and email are managed through your Google account.</p><Button variant="outline" disabled={pending} onClick={async () => { setPending(true); try { await signOut(); } finally { setPending(false); } }}><LogOut size={16}/>{pending ? 'Signing out…' : 'Sign out'}</Button></section><section className="account-adventures"><Compass size={29}/><h2>A little more to look forward to.</h2>{loading ? <p role="status">Loading your adventures…</p> : error ? <div role="alert"><p>We couldn’t load your trips.</p><Button variant="outline" onClick={() => void load()}>Try again</Button></div> : <div className="profile-counts"><div><strong>{trips.length}</strong><span>Trips planned</span></div><div><strong>{trips.reduce((sum, trip) => sum + trip.days.reduce((n, day) => n + day.stops.length, 0), 0)}</strong><span>Trail stops</span></div></div>}<Link href="/trips" className="account-page-link"><Route size={18}/>My trips<ArrowUpRight size={17}/></Link><Link href="/explore" className="account-page-link"><Compass size={18}/>Find your next trail<ArrowUpRight size={17}/></Link></section></div></main>;
}
export default function ProfilePage() { return <AuthGate><Profile/></AuthGate>; }
