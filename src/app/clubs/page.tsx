'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { getErrorMessage } from '@/lib/utils';

interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string | null;
  memberCount: number;
  role: 'owner' | 'admin' | 'moderator' | 'member' | null;
}

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadClubs = useCallback(async () => {
    if (!supabase) {
      setError('Club listings are unavailable because the database is not configured.');
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const [{ data: clubRows, error: clubError }, { data: membershipRows, error: membershipError }] = await Promise.all([
        supabase
          .from('clubs')
          .select('id, name, slug, description, owner_id')
          .order('name', { ascending: true }),
        supabase
          .from('club_members')
          .select('club_id, user_id, role'),
      ]);
      if (clubError) throw clubError;
      if (membershipError) throw membershipError;

      const membersByClub = new Map<string, number>();
      const roleByClub = new Map<string, Club['role']>();
      for (const membership of membershipRows ?? []) {
        membersByClub.set(membership.club_id, (membersByClub.get(membership.club_id) ?? 0) + 1);
        if (membership.user_id === user?.id) {
          roleByClub.set(membership.club_id, membership.role as Club['role']);
        }
      }

      setClubs((clubRows ?? []).map((club) => ({
        id: club.id,
        name: club.name,
        slug: club.slug,
        description: club.description,
        ownerId: club.owner_id,
        memberCount: membersByClub.get(club.id) ?? 0,
        role: roleByClub.get(club.id) ?? null,
      })));
    } catch (loadError) {
      console.error('Unable to load clubs:', loadError);
      const code = typeof loadError === 'object' && loadError !== null && 'code' in loadError
        ? loadError.code
        : null;
      setError(
        code === 'PGRST205' || code === '42703'
          ? 'The club database update is not applied yet. Run sql/fix_matchmaking_and_seed_puzzles.sql in the Supabase SQL Editor.'
          : getErrorMessage(loadError, 'Unable to load clubs.')
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  const visibleClubs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return clubs;
    return clubs.filter((club) => (
      club.name.toLocaleLowerCase().includes(query) ||
      club.description?.toLocaleLowerCase().includes(query) ||
      club.slug.toLocaleLowerCase().includes(query)
    ));
  }, [clubs, search]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !supabase) {
      setError('Sign in to create a club.');
      return;
    }
    const trimmedName = name.trim();
    const slug = trimmedName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
      .replace(/-$/g, '');
    if (trimmedName.length < 3 || trimmedName.length > 40 || !slug) {
      setError('Choose a club name between 3 and 40 characters, using letters or numbers.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const { error: createError } = await supabase.rpc('create_club', {
        p_name: trimmedName,
        p_slug: slug,
        p_description: description.trim() || null,
      });
      if (createError) throw createError;
      setName('');
      setDescription('');
      setNotice(`Club “${trimmedName}” created.`);
      await loadClubs();
    } catch (createError) {
      console.error('Unable to create club:', createError);
      setError(getErrorMessage(createError, 'Unable to create club.'));
    } finally {
      setSaving(false);
    }
  };

  const handleMembership = async (club: Club) => {
    if (!user || !supabase) {
      setError('Sign in to join a club.');
      return;
    }
    setActionId(club.id);
    setError(null);
    setNotice(null);
    try {
      if (club.role === 'owner') {
        setError('Club owners cannot leave until ownership transfer is available.');
        return;
      }
      const { data, error: membershipError } = await supabase.rpc(
        club.role ? 'leave_club' : 'join_club',
        { p_club_id: club.id }
      );
      if (membershipError) throw membershipError;
      setNotice(data?.status === 'already_member' ? 'You are already a club member.' : club.role ? 'You left the club.' : `You joined ${club.name}.`);
      await loadClubs();
    } catch (membershipError) {
      console.error('Unable to update club membership:', membershipError);
      setError(getErrorMessage(membershipError, 'Unable to update club membership.'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">ChessArena community</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Clubs</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Find your chess community, meet players, and organize club tournaments.
        </p>
      </header>

      {error && <div role="alert" className="mb-5 break-words rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</div>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">{notice}</p>}

      {!user && (
        <div className="mb-6 rounded-xl border border-accent/20 bg-background-secondary p-5">
          Sign in to join a club or create one.{' '}
          <Link href="/auth/login" className="font-semibold text-accent hover:underline">Sign in</Link>
        </div>
      )}

      {user && (
        <section className="mb-8 rounded-xl border border-accent/20 bg-background-secondary p-5 md:p-6">
          <h2 className="text-xl font-bold">Start a club</h2>
          <p className="mt-1 text-sm text-text-secondary">Create a public home for your chess group. You will be its owner.</p>
          <form onSubmit={(event) => void handleCreate(event)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-text-secondary">
              Club name
              <input
                required
                minLength={3}
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Downtown Chess Club"
                className="mt-1 w-full rounded-lg border border-text-secondary/20 bg-background-tertiary px-3 py-2 text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Short description
              <input
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What brings your players together?"
                className="mt-1 w-full rounded-lg border border-text-secondary/20 bg-background-tertiary px-3 py-2 text-text-primary"
              />
            </label>
            <div className="flex items-center justify-between gap-3 md:col-span-2">
              <p className="text-xs text-text-secondary">Club addresses are generated from the name and must be unique.</p>
              <button
                type="submit"
                disabled={saving}
                className="shrink-0 rounded-lg bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create club'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Discover clubs</h2>
            <p className="mt-1 text-sm text-text-secondary">{clubs.length} public {clubs.length === 1 ? 'club' : 'clubs'}</p>
          </div>
          <label className="w-full text-sm text-text-secondary sm:w-72">
            Search clubs
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or topic"
              className="mt-1 w-full rounded-lg border border-text-secondary/20 bg-background-secondary px-3 py-2 text-text-primary"
            />
          </label>
        </div>

        {loading ? (
          <p role="status" className="rounded-xl bg-background-secondary p-6 text-text-secondary">Loading clubs…</p>
        ) : visibleClubs.length === 0 ? (
          <div className="rounded-xl bg-background-secondary p-8 text-center">
            <p className="text-text-secondary">{error ? 'Club listings could not be loaded.' : search ? 'No clubs match your search.' : 'No clubs yet. Create one and invite your chess friends.'}</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleClubs.map((club) => (
              <li key={club.id} className="flex flex-col rounded-xl border border-text-secondary/10 bg-background-secondary p-5">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{club.name}</h3>
                      <p className="text-xs text-text-secondary">/{club.slug}</p>
                    </div>
                    {club.role && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold capitalize text-accent">{club.role}</span>}
                  </div>
                  <p className="mt-3 min-h-10 text-sm text-text-secondary">{club.description || 'A ChessArena player community.'}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-text-secondary/10 pt-4">
                  <span className="text-sm text-text-secondary">{club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}</span>
                  <button
                    onClick={() => void handleMembership(club)}
                    disabled={!user || actionId === club.id || club.role === 'owner'}
                    className="rounded-lg border border-accent/40 px-3 py-2 text-sm font-semibold text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionId === club.id ? 'Saving…' : club.role === 'owner' ? 'You own this club' : club.role ? 'Leave club' : user ? 'Join club' : 'Sign in to join'}
                  </button>
                </div>
                {club.role && ['owner', 'admin', 'moderator'].includes(club.role) && (
                  <Link href="/tournaments" className="mt-3 text-center text-sm font-semibold text-accent hover:underline">
                    Organize a tournament
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
