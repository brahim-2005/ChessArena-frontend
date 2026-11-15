import { NextRequest, NextResponse } from 'next/server';
import { isLegalPuzzleSolution } from '@/lib/chess/puzzleValidation';
import { createAdminClient } from '@/lib/supabase/admin';

type RouteContext = { params: Promise<{ puzzleId: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { puzzleId } = await params;
    if (!UUID_PATTERN.test(puzzleId)) {
      return NextResponse.json({ error: 'Invalid puzzle ID' }, { status: 400 });
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

    const body = parsedBody as { action?: unknown; history?: unknown; move?: unknown };
    if (
      (body.action !== 'move' && body.action !== 'hint') ||
      !Array.isArray(body.history) ||
      body.history.length > 200 ||
      !body.history.every((move: unknown) => typeof move === 'string' && move.length <= 10) ||
      (body.action === 'move' && (typeof body.move !== 'string' || body.move.length > 10))
    ) {
      return NextResponse.json({ error: 'Invalid puzzle step request' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: puzzle, error } = await admin
      .from('puzzles')
      .select('id, fen, solution_moves')
      .eq('id', puzzleId)
      .maybeSingle();
    if (error) {
      console.error('Puzzle lookup failed:', error.message);
      return NextResponse.json({ error: 'Unable to verify puzzle move' }, { status: 500 });
    }
    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }
    if (
      typeof puzzle.fen !== 'string' ||
      !Array.isArray(puzzle.solution_moves) ||
      !puzzle.solution_moves.every((move: unknown): move is string => typeof move === 'string') ||
      !isLegalPuzzleSolution(puzzle.fen, puzzle.solution_moves)
    ) {
      console.error('Puzzle has invalid persisted solution data:', puzzle.id);
      return NextResponse.json({ error: 'Puzzle data is invalid' }, { status: 500 });
    }

    const history = body.history as string[];
    if (
      history.length > puzzle.solution_moves.length ||
      history.some((move, index) => move !== puzzle.solution_moves[index])
    ) {
      return NextResponse.json({ error: 'Puzzle position is out of sync' }, { status: 409 });
    }

    const expectedMove = puzzle.solution_moves[history.length];
    if (body.action === 'hint') {
      return NextResponse.json({ move: expectedMove ?? null });
    }
    if (!expectedMove) {
      return NextResponse.json({ error: 'Puzzle is already complete' }, { status: 409 });
    }
    if (body.move !== expectedMove) {
      return NextResponse.json({ correct: false });
    }

    const acceptedMoves = [...history, expectedMove];
    const reply = puzzle.solution_moves[acceptedMoves.length] ?? null;
    if (reply) acceptedMoves.push(reply);

    return NextResponse.json({
      correct: true,
      moves: acceptedMoves,
      reply,
      solved: acceptedMoves.length === puzzle.solution_moves.length,
    });
  } catch (error) {
    console.error('Puzzle step request failed:', error);
    return NextResponse.json({ error: 'Unable to process puzzle move' }, { status: 500 });
  }
}
