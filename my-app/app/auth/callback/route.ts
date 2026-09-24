import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeAuthDestination } from '@/lib/supabase/redirect';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code && !searchParams.has('error')) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(safeAuthDestination(searchParams.get('next'), origin));
        response.headers.set('Cache-Control', 'private, no-store');
        return response;
      }
    } catch { /* A canceled, expired, or unavailable sign-in can be retried. */ }
  }
  const response = NextResponse.redirect(new URL('/auth/error', origin));
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
