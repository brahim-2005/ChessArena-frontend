import { NextRequest, NextResponse } from 'next/server';
import { Chess, type Square } from 'chess.js';
import { parseTimeControl } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ gameId: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getPlayer() {
  const authClient = await createServerClient();
  const { data: { user }, error } = await authClient.auth.getUser();
  return { user: error ? null : user };
}

function gameActionErrorResponse(error: { code?: string }, fallback: string) {
  if (error.code === 'PGRST202' || error.code === '42883') {
    return NextResponse.json(
      { error: 'The game-results database update is missing. Apply the latest sql/fix_matchmaking_and_seed_puzzles.sql in Supabase.' },
      { status: 503 },
    );
  }
  if (error.code === '40001') {
    return NextResponse.json(
      { error: 'The game changed before your action was saved. Refresh the game and try again.' },
      { status: 409 },
    );
  }
  if (error.code === '42501') {
    return NextResponse.json({ error: 'You are not authorized to make this game action.' }, { status: 403 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { gameId } = await params;
    if (!UUID_PATTERN.test(gameId)) {
      return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
    }

    const { user } = await getPlayer();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: game, error } = await admin
      .from('games')
      .select('id, white_player_id, black_player_id, white_rating, black_rating, white_rating_change, black_rating_change, time_control, status, result, moves, fen, started_at, ended_at')
      .eq('id', gameId)
      .maybeSingle();

    if (error) {
      console.error('Game lookup failed:', error.message);
      return NextResponse.json({ error: 'Unable to load game' }, { status: 500 });
    }
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (game.white_player_id !== user.id && game.black_player_id !== user.id) {
      return NextResponse.json({ error: 'You are not a participant in this game' }, { status: 403 });
    }
    if (!Array.isArray(game.moves) || !game.moves.every((move: unknown) => typeof move === 'string')) {
      console.error('Game has invalid persisted move data:', game.id);
      return NextResponse.json({ error: 'Game data is invalid' }, { status: 500 });
    }

    return NextResponse.json({
      id: game.id,
      whitePlayerId: game.white_player_id,
      blackPlayerId: game.black_player_id,
      whiteRating: game.white_rating,
      blackRating: game.black_rating,
      whiteRatingChange: game.white_rating_change,
      blackRatingChange: game.black_rating_change,
      timeControl: parseTimeControl(game.time_control),
      status: game.status,
      result: game.result === 'in_progress' ? null : game.result,
      moves: game.moves,
      fen: game.fen,
      startedAt: game.started_at,
      endedAt: game.ended_at,
    });
  } catch (error) {
    console.error('Game API GET error:', error);
    return NextResponse.json({ error: 'Unable to load game' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { gameId } = await params;
    if (!UUID_PATTERN.test(gameId)) {
      return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
    }

    const { user } = await getPlayer();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let parsedBody: unknown;
    try {
      parsedBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
    }
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const body = parsedBody as { action?: unknown; move?: unknown };
    if (body.action !== 'move' && body.action !== 'resign') {
      return NextResponse.json({ error: 'Invalid game action' }, { status: 400 });
    }
    if (body.action === 'move' && (typeof body.move !== 'string' || body.move.length > 10)) {
      return NextResponse.json({ error: 'Invalid move request' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: game, error: lookupError } = await admin
      .from('games')
      .select('id, white_player_id, black_player_id, status, result, moves, fen')
      .eq('id', gameId)
      .maybeSingle();
    if (lookupError) {
      console.error('Game move lookup failed:', lookupError.message);
      return NextResponse.json({ error: 'Unable to load game' }, { status: 500 });
    }
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (game.white_player_id !== user.id && game.black_player_id !== user.id) {
      return NextResponse.json({ error: 'You are not a participant in this game' }, { status: 403 });
    }
    if (game.status !== 'in_progress' || game.result !== 'in_progress') {
      return NextResponse.json({ error: 'Game is not in progress' }, { status: 409 });
    }
    if (typeof game.fen !== 'string' || !Array.isArray(game.moves) ||
        !game.moves.every((move: unknown) => typeof move === 'string')) {
      console.error('Game has invalid persisted state:', game.id);
      return NextResponse.json({ error: 'Game data is invalid' }, { status: 500 });
    }

    if (body.action === 'resign') {
      const { data, error: actionError } = await admin.rpc('apply_online_game_action', {
        p_game_id: game.id,
        p_actor_id: user.id,
        p_expected_fen: game.fen,
        p_action: 'resign',
        p_next_fen: null,
        p_moves: null,
        p_pgn: null,
        p_result: null,
      });

      if (actionError) {
        console.error('Game resignation transaction failed:', actionError.message);
        return gameActionErrorResponse(actionError, 'Unable to save resignation.');
      }

      return NextResponse.json({ success: true, gameOver: true, ...data });
    }

    if (typeof body.move !== 'string') {
      return NextResponse.json({ error: 'Invalid move request' }, { status: 400 });
    }

    const chess = new Chess(game.fen);
    const isWhiteTurn = chess.turn() === 'w';
    if ((isWhiteTurn && game.white_player_id !== user.id) ||
        (!isWhiteTurn && game.black_player_id !== user.id)) {
      return NextResponse.json({ error: 'It is not your turn' }, { status: 409 });
    }

    let playedMove;
    try {
      if (/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(body.move)) {
        playedMove = chess.move({
          from: body.move.slice(0, 2).toLowerCase() as Square,
          to: body.move.slice(2, 4).toLowerCase() as Square,
          promotion: (body.move[4]?.toLowerCase() || 'q') as 'q' | 'r' | 'b' | 'n',
        });
      } else {
        playedMove = chess.move(body.move);
      }
    } catch {
      return NextResponse.json({ error: 'Illegal move' }, { status: 400 });
    }
    if (!playedMove) {
      return NextResponse.json({ error: 'Illegal move' }, { status: 400 });
    }

    const completed = chess.isGameOver();
    const result = completed
      ? chess.isCheckmate()
        ? chess.turn() === 'w' ? 'black_wins' : 'white_wins'
        : 'draw'
      : 'in_progress';
    const moves = [...game.moves, playedMove.san];
    const { data, error: actionError } = await admin.rpc('apply_online_game_action', {
      p_game_id: game.id,
      p_actor_id: user.id,
      p_expected_fen: game.fen,
      p_action: 'move',
      p_next_fen: chess.fen(),
      p_moves: moves,
      p_pgn: chess.pgn(),
      p_result: result,
    });

    if (actionError) {
      console.error('Game move transaction failed:', actionError.message);
      return gameActionErrorResponse(actionError, 'Unable to save move.');
    }

    return NextResponse.json({
      success: true,
      fen: chess.fen(),
      move: playedMove.san,
      gameOver: completed,
      result: result === 'in_progress' ? null : result,
      ...data,
    });
  } catch (error) {
    console.error('Game API POST error:', error);
    return NextResponse.json({ error: 'Unable to save move' }, { status: 500 });
  }
}
