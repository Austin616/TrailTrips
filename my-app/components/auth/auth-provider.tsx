'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { errorMessage, usePlanner } from '@/lib/store';

type AuthState = { user: User | null; loading: boolean; configured: boolean; error: string | null; signIn: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getSupabase();
  useEffect(() => {
    // Discard the old shared demo cache; never migrate it into a real account.
    try { localStorage.removeItem('trailtrips-planner-v1'); } catch { /* Storage may be disabled. */ }
    const apply = (next: User | null) => {
      if (usePlanner.getState().userId !== (next?.id ?? null)) {
        usePlanner.getState().reset(next?.id ?? null);
        if (next) void usePlanner.getState().load();
      }
      setUser(next);
      setLoading(false);
    };
    if (!db) { apply(null); return; }
    // INITIAL_SESSION also covers a signed-out browser; token refresh keeps the same account.
    const { data } = db.auth.onAuthStateChange((_event, session) => { apply(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, [db]);
  async function signIn() {
    setError(null);
    if (!db) { setError('Sign-in is being set up. Please try again soon.'); return; }
    try {
      const next = window.location.pathname + window.location.search;
      const { error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
      if (error) throw error;
    } catch (error) { setError(errorMessage(error)); }
  }
  async function signOut() {
    if (!db) return;
    setError(null);
    const { error } = await db.auth.signOut({ scope: 'local' });
    if (error) { setError(errorMessage(error)); return; }
    usePlanner.getState().reset(null);
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, configured: !!db, error, signIn, signOut }}>{children}{error && <div className="auth-notice" role="alert">{error}<button aria-label="Dismiss notification" onClick={() => setError(null)}>×</button></div>}</AuthContext.Provider>;
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider is required');
  return auth;
}
