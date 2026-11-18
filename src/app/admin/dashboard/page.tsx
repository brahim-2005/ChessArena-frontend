'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n/context';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const { tr } = useI18n();

  if (loading) {
    return <p role="status" className="p-8 text-center text-text-secondary">{tr('Checking access…')}</p>;
  }

  if (user?.app_metadata?.role !== 'admin') {
    return (
      <main className="mx-auto max-w-xl rounded-xl border border-text-secondary/10 bg-background-secondary p-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">{tr('Administrator access required')}</h1>
        <p role="status" className="mt-3 text-text-secondary">
          {tr('This area is restricted to accounts with an administrator role.')}
        </p>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">{tr('Return home')}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl rounded-xl border border-text-secondary/10 bg-background-secondary p-8">
      <h1 className="text-2xl font-bold text-text-primary">{tr('Administration')}</h1>
      <p role="status" className="mt-3 text-text-secondary">
        {tr('Administrator identity verified. Management tools are not enabled until their server-side authorization and audit logging are implemented.')}
      </p>
    </main>
  );
}
