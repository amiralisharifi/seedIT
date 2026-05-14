import { redirect } from 'next/navigation';

// The root URL has no meaningful content — middleware handles the
// auth-gating redirect, but as a fallback we send users to /dashboard.
// If they're not logged in, middleware bounces them to /login.
export default function RootPage() {
  redirect('/dashboard');
}
