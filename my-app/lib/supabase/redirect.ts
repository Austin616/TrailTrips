export function safeAuthDestination(next: string | null, origin: string) {
  try {
    const target = new URL(next || '/trips', origin);
    if (target.origin === origin && !target.pathname.startsWith('/auth/')) return target;
  } catch { /* Invalid destinations return to the user's trips. */ }
  return new URL('/trips', origin);
}
