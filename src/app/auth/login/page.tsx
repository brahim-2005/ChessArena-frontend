'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n/context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { tr } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-secondary rounded-xl p-8 border border-text-secondary/15 shadow-card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{tr('Welcome Back')}</h1>
          <p className="text-text-secondary">{tr('Sign in to your ChessArena account')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {tr(error)}
            </div>
          )}

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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-accent/20"
          >
            {loading ? tr('Signing in...') : tr('Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-text-secondary text-sm">
          <p>{tr("Don't have an account?")} <Link href="/auth/signup" className="text-accent hover:text-accent-hover font-medium">{tr('Sign up')}</Link></p>
          <p className="mt-2"><Link href="/auth/reset-password" className="text-accent hover:text-accent-hover">{tr('Forgot password?')}</Link></p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-text-secondary hover:text-text-primary text-sm">← {tr('Back to Home')}</Link>
        </div>
      </div>
    </div>
  );
}