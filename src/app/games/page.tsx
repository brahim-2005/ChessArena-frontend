'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

interface GameHistoryItem {
  id: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw' | 'in_progress';
  timeControl: string;
  date: string;
  moves: string[];
}

export default function GamesHistoryPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    if (!user) return;
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { data, error } = await supabase
        .from('games')
        .select('id, white_player_id, black_player_id, result, time_control, started_at, moves')
        .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const opponentIds = [...new Set((data ?? [])
        .map((game) => game.white_player_id === user.id ? game.black_player_id : game.white_player_id)
        .filter((id): id is string => Boolean(id)))];
      const usernames = new Map<string, string>();
      if (opponentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', opponentIds);
        if (profilesError) throw profilesError;
        for (const profile of profiles ?? []) usernames.set(profile.id, profile.username);
      }

      const parsedGames = (data ?? []).map((g) => {
        const isWhite = g.white_player_id === user.id;
        const opponentId = isWhite ? g.black_player_id : g.white_player_id;
        let result: 'win' | 'loss' | 'draw' | 'in_progress' = 'in_progress';

        if (g.result === 'white_wins') {
          result = isWhite ? 'win' : 'loss';
        } else if (g.result === 'black_wins') {
          result = !isWhite ? 'win' : 'loss';
        } else if (g.result === 'draw') {
          result = 'draw';
        }

        return {
          id: g.id,
          opponent: opponentId ? usernames.get(opponentId) ?? 'Player' : 'Unknown opponent',
          result,
          timeControl: g.time_control || '3+2',
          date: new Date(g.started_at).toLocaleDateString(),
          moves: g.moves || [],
        };
      }) || [];

      setGames(parsedGames);
    } catch (err) {
      console.error('Error loading games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game history.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) void loadGames();
  }, [loadGames, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-background-secondary rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h1>
          <p className="text-text-secondary mb-6">Please sign in to view your game history.</p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading game history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Game History</h1>
            <p className="text-text-secondary">Review your past games and analyze moves</p>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 text-red-300">{error}</p>}
        {!error && games.length === 0 ? (
          <div className="bg-background-secondary rounded-xl p-12 text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Games Yet</h3>
            <p className="text-text-secondary mb-6">Play your first game to start tracking history.</p>
            <Link
              href="/play"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors inline-block"
            >
              Play Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-background-secondary rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-text-secondary/10 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                    game.result === 'win' ? 'bg-green-500/20 text-green-400' :
                    game.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                    game.result === 'draw' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {game.result === 'win' ? 'W' :
                     game.result === 'loss' ? 'L' :
                     game.result === 'draw' ? 'D' : '—'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Vs {game.opponent}</h3>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <span>{game.timeControl}</span>
                      <span>•</span>
                      <span>{game.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-text-secondary">
                    {game.moves.length} moves
                  </span>
                  <Link
                    href={`/game/${encodeURIComponent(game.id)}`}
                    className="px-4 py-2 bg-background-tertiary hover:bg-background text-text-primary border border-text-secondary/20 rounded-lg transition-colors"
                  >
                    Review Game
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}