'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    router.replace('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-[65vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-text-secondary/10 bg-background-secondary p-8">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Choose a new password</h1>
        <p className="mb-6 text-sm text-text-secondary">Use at least 8 characters.</p>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="new-password" className="block text-sm text-text-secondary">New password</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-lg border border-text-secondary/20 bg-background-tertiary px-4 py-3 text-text-primary"
          />
          <label htmlFor="confirm-new-password" className="block text-sm text-text-secondary">Confirm password</label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-lg border border-text-secondary/20 bg-background-tertiary px-4 py-3 text-text-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <Link href="/auth/login" className="mt-6 inline-block text-sm text-accent hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}
