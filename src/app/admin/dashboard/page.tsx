'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status" className="p-8 text-center text-text-secondary">Checking access…</p>;
  }

  if (user?.app_metadata?.role !== 'admin') {
    return (
      <main className="mx-auto max-w-xl rounded-xl border border-text-secondary/10 bg-background-secondary p-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Administrator access required</h1>
        <p role="status" className="mt-3 text-text-secondary">
          This area is restricted to accounts with an administrator role.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">Return home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl rounded-xl border border-text-secondary/10 bg-background-secondary p-8">
      <h1 className="text-2xl font-bold text-text-primary">Administration</h1>
      <p role="status" className="mt-3 text-text-secondary">
        Administrator identity verified. Management tools are not enabled until their server-side authorization and audit logging are implemented.
      </p>
    </main>
  );
}
