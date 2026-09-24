'use client';
import { useState } from 'react';
import { Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';

export function SignInButton() {
  const { signIn, loading } = useAuth();
  const [pending, setPending] = useState(false);
  return <Button disabled={loading || pending} onClick={async () => { setPending(true); try { await signIn(); } finally { setPending(false); } }}>{loading ? 'Loading…' : pending ? 'Connecting…' : 'Sign in to get started'}</Button>;
}
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="section page-main"><p role="status">Opening your adventures…</p></main>;
  if (!user) return <main className="section page-main"><div className="auth-card"><Mountain size={36}/><p className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</p><h1>Sign in to get started</h1><p>Build your own trips and save your favorite trail stops. Your plans stay with your account, wherever you sign in.</p><SignInButton/><small>Continue securely with Google</small></div></main>;
  return children;
}
