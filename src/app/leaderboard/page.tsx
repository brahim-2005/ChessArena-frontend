'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface LeaderboardEntry {
  username: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Set the public Supabase URL and key.');
      }

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rating', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }
      const parsedEntries = (data ?? []).map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        rating: entry.rating ?? 1200,
        gamesPlayed: entry.games_played ?? 0,
        wins: entry.wins ?? 0,
        losses: entry.losses ?? 0,
        draws: entry.draws ?? 0,
      }));
      setEntries(parsedEntries);
      setLoading(false);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">Loading Leaderboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
          <p className="text-text-secondary">
            Top rated players on ChessArena
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!error && entries.length === 0 && (
          <p className="mb-4 text-text-secondary">No ranked players yet.</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-background-secondary rounded-lg border border-text-secondary/10">
            <thead>
              <tr className="border-b border-text-secondary/20">
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Rank</th>
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Player</th>
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Rating</th>
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Games</th>
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Wins</th>
                <th className="text-left p-4 text-text-secondary font-medium text-sm">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.rank} className="border-b border-text-secondary/20 hover:bg-accent/5 transition-colors">
                  <td className="p-4 text-center text-sm font-medium">{entry.rank}</td>
                  <td className="p-4 text-left">
                    <Link
                      href={`/profile/${encodeURIComponent(entry.username)}`}
                      className="text-text-primary hover:text-accent transition-colors font-medium"
                    >
                      {entry.username}
                    </Link>
                  </td>
                  <td className="p-4 text-center text-xl font-bold text-accent">
                    {entry.rating}
                  </td>
                  <td className="p-4 text-center text-sm text-text-secondary">
                    {entry.gamesPlayed}
                  </td>
                  <td className="p-4 text-center text-sm text-green-400">
                    {entry.wins}
                  </td>
                  <td className="p-4 text-center text-sm text-green-300">
                    {(entry.wins / Math.max(1, entry.gamesPlayed) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center text-text-secondary">
          <p>Showing top {entries.length} players</p>
          <Link href="/play" className="text-accent hover:text-accent-hover font-medium">
            Play a game to join rankings →
          </Link>
        </div>
      </div>
    </div>
  );
}