import { createBrowserClient } from '@supabase/ssr';

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  // The SSR helper shares a browser singleton and stores the PKCE/session in cookies.
  return createBrowserClient(url, key);
}
