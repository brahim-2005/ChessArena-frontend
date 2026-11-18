'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n/context';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { tr } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, username);
    if (result.error) {
      const message = result.error.message;
      setError(
        /rate.?limit|too many requests/i.test(message)
          ? 'Supabase has temporarily limited signup emails. Please wait before trying again, or sign in if you already created an account.'
          : message
      );
      setLoading(false);
    } else if (result.needsEmailConfirmation) {
      setSuccess('Account created. Check your email for a confirmation link before signing in.');
      setLoading(false);
    } else {
      router.push('/play');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-secondary rounded-xl p-8 border border-text-secondary/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{tr('Create Account')}</h1>
          <p className="text-text-secondary">{tr('Join ChessArena and start playing')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
              <p>{tr(error)}</p>
              {/rate.?limit|too many requests/i.test(error) && (
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href="/auth/login" className="underline hover:text-red-300">{tr('Sign in')}</Link>
                  <Link href="/play" className="underline hover:text-red-300">{tr('Try local play without an account')}</Link>
                </div>
              )}
            </div>
          )}
          {success && (
            <div role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
              <p>{tr(success)}</p>
              <Link href="/auth/login" className="mt-2 inline-block underline hover:text-green-200">{tr('Go to sign in')}</Link>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
              {tr('Username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              autoComplete="username"
            />
            <p className="text-xs text-text-secondary mt-1">{tr('3-20 characters, letters, numbers, and underscores only')}</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              {tr('Email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              {tr('Password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
              {tr('Confirm Password')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? tr('Creating Account...') : tr('Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-text-secondary">
          <p>{tr('Already have an account?')} <Link href="/auth/login" className="text-accent hover:text-accent-hover">{tr('Sign in')}</Link></p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-text-secondary hover:text-text-primary">← {tr('Back to Home')}</Link>
        </div>
      </div>
    </div>
  );
}