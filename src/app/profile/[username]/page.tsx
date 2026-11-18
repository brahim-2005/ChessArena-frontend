'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  joinDate: string;
  preferences: ProfilePreferences;
}

interface ProfilePreferences {
  boardTheme?: string;
  pieceTheme?: string;
  soundEnabled?: boolean;
  timeControl?: string;
}

interface RecentGame {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string | null;
  result: string;
  startedAt: string;
  endedAt: string | null;
  pgn: string | null;
}

export default function ProfilePage() {
  const usernameParam = useParams().username;
  const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (loading) return;
    if (!username) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfile(null);
    setRecentGames([]);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, rating, games_played, wins, losses, draws, join_date')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;

      let preferences: ProfilePreferences = {};
      if (user?.id === profile.id) {
        const { data: preferencesRow, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (preferencesError) throw preferencesError;
        if (preferencesRow?.preferences && typeof preferencesRow.preferences === 'object') {
          preferences = preferencesRow.preferences as ProfilePreferences;
        }
      }

      setProfile({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name || '',
        avatarUrl: profile.avatar_url,
        rating: profile.rating ?? 200,
        gamesPlayed: profile.games_played || 0,
        wins: profile.wins || 0,
        losses: profile.losses || 0,
        draws: profile.draws || 0,
        joinDate: profile.join_date ? new Date(profile.join_date).toLocaleDateString() : '',
        preferences,
      });

      // Fetch recent games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, white_player_id, black_player_id, result, started_at, ended_at, pgn')
        .or(`white_player_id.eq.${profile.id},black_player_id.eq.${profile.id}`)
        .order('started_at', { ascending: false })
        .limit(5);

      if (gamesError) throw gamesError;
      if (games) {
        const parsedGames = games.map((g) => ({
          id: g.id,
          whitePlayerId: g.white_player_id,
          blackPlayerId: g.black_player_id,
          result: g.result,
          startedAt: g.started_at,
          endedAt: g.ended_at,
          pgn: g.pgn,
        }));
        setRecentGames(parsedGames);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  }, [loading, user, username]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">Profile Loading...</h2>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Profile Not Found
          </h1>
          <p role={error ? 'alert' : undefined} className={error ? 'text-red-300' : 'text-text-secondary'}>
            {error || 'The requested profile could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  const handleUpdatePreferences = async (newPrefs: ProfilePreferences) => {
    if (!isOwnProfile) {
      throw new Error('You can only change your own preferences.');
    }
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: profile.id, preferences: newPrefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    if (updateError) {
      throw new Error(updateError.message);
    }

    setProfile({ ...profile, preferences: newPrefs });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent text-white font-bold text-lg flex items-center justify-center">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{profile.fullName || profile.username}</h1>
              <p className="text-text-secondary">{profile.joinDate}</p>
            </div>
          </div>

          {/* Rating and Actions */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl md:text-4xl font-bold text-accent">{profile.rating}</div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              user?.user_metadata?.username === profile.username ? 'bg-accent/20 text-accent' :
              'bg-text-secondary/20 text-text-secondary'
            }`}>
              Rating
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'profile' ? 'bg-accent text-white' :
              'text-text-primary hover:text-accent hover:bg-accent/10 transition-colors'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'games' ? 'bg-accent text-white' :
              'text-text-primary hover:text-accent hover:bg-accent/10 transition-colors'
            }`}
          >
            Games
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'preferences' ? 'bg-accent text-white' :
                'text-text-primary hover:text-accent hover:bg-accent/10 transition-colors'
              }`}
            >
              Preferences
            </button>
          )}
        </div>

        {/* Profile Content */}
        {activeTab === 'games' && recentGames.length > 0 ? (
          <RecentGames section={recentGames} />
        ) : (
          <div className="bg-background-secondary rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Games Played</h3>
                <p className="text-3xl font-bold text-accent">{profile.gamesPlayed}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Win Rate</h3>
                <p className="text-3xl font-bold text-green-400">
                  {(profile.wins / Math.max(1, profile.gamesPlayed) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Wins</h3>
                <p className="text-xl text-green-400">{profile.wins}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Losses</h3>
                <p className="text-xl text-red-400">{profile.losses}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Draws</h3>
                <p className="text-xl text-yellow-400">{profile.draws}</p>
              </div>
            </div>

            <p className="text-text-secondary mt-4">
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
              {' '}
            </p>
          </div>
        )}

        {activeTab === 'preferences' && isOwnProfile && (
          <PreferencesModal
            profile={profile}
            onUpdate={handleUpdatePreferences}
            onClose={() => setActiveTab('profile')}
          />
        )}
      </div>
    </div>
  );
}

function RecentGames({ section }: { section: RecentGame[] }) {
  return (
    <div className="space-y-3">
      {section.map((game, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {game.result ? (
              <span className={`text-sm font-medium ${
                game.result.includes('white_wins') ? 'text-green-400' :
                game.result.includes('black_wins') ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {game.result.replace('_', ' ')}
              </span>
            ) : (
              <span className="text-sm text-text-secondary">In Progress</span>
            )}
            <span className="text-xs text-text-secondary">
              {new Date(game.startedAt).toLocaleDateString()}
            </span>
          </div>
          <span className="text-xs text-text-secondary">
            {game.endedAt ? new Date(game.endedAt).toLocaleDateString() : 'Ongoing'}
          </span>
        </div>
      ))}
    </div>
  );
}

function PreferencesModal({ profile, onUpdate, onClose }: {
  profile: ProfileData;
  onUpdate: (newPrefs: ProfilePreferences) => Promise<void>;
  onClose: () => void;
}) {
  const [preferences, setPreferences] = useState<ProfilePreferences>(profile.preferences);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setError('');
      await onUpdate(preferences);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save preferences.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-8 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Preferences</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl">&times;</button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}>
          {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Board Theme
              </label>
              <select
                value={preferences.boardTheme || 'dark'}
                onChange={(e) => setPreferences({
                  ...preferences,
                  boardTheme: e.target.value,
                })}
                className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="wood">Wood</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Piece Theme
              </label>
              <select
                value={preferences.pieceTheme || 'standard'}
                onChange={(e) => setPreferences({
                  ...preferences,
                  pieceTheme: e.target.value,
                })}
                className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="standard">Standard</option>
                <option value="merida">Merida</option>
                <option value="cps">CPS</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Sound
            </label>
            <select
              value={String(preferences.soundEnabled !== false)}
              onChange={(e) => setPreferences({
                ...preferences,
                soundEnabled: e.target.value !== 'false',
              })}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Time Control
            </label>
            <select
              value={preferences.timeControl || '3+2'}
              onChange={(e) => setPreferences({
                ...preferences,
                timeControl: e.target.value,
              })}
              className="w-full px-4 py-3 bg-background-tertiary border border-text-secondary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="1+0">1+0 Bullet</option>
              <option value="3+2">3+2 Blitz</option>
              <option value="5+0">5+0 Blitz</option>
              <option value="10+0">10+0 Rapid</option>
              <option value="15+10">15+10</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}