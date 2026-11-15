import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (q.length < 2) {
      return NextResponse.json({ players: [] });
    }

    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, rating, games_played, wins, losses, draws, join_date')
      .neq('id', user.id)
      .ilike('username', `%${q}%`)
      .order('rating', { ascending: false })
      .limit(10);

    if (queryError) {
      throw queryError;
    }

    return NextResponse.json({ players: profiles || [] });
  } catch (error) {
    console.error('Player search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to search players' },
      { status: 500 }
    );
  }
}
