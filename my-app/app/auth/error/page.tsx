import Link from 'next/link';
export default function AuthError() {
  return <main className="section page-main"><div className="auth-card"><h1>Unable to sign in</h1><p role="alert">Google sign-in was canceled, expired, or could not be completed. Please try again.</p><Link href="/trips" className="text-link">Back to sign-in</Link></div></main>;
}
