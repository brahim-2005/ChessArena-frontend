import { Chess, type Move as ChessMove } from 'chess.js';

export type BotDifficulty = 'easy' | 'medium' | 'hard' | '100' | '300' | '500' | '700' | '900' | '1100' | '1300' | '1500' | '1800' | '2200' | '2500' | '2800';

export interface BotMove {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

function getPromotion(promotion?: string): BotMove['promotion'] {
  if (promotion === 'q' || promotion === 'r' || promotion === 'b' || promotion === 'n') {
    return promotion;
  }
  return undefined;
}

function getMoveScore(move: ChessMove, difficulty: string): number {
  const pieceValues: Record<string, number> = { p: 10, n: 30, b: 35, r: 50, q: 90, k: 1000 };
  let score = 0;
  if (move.captured) {
    score += (pieceValues[move.captured] || 10) * 10 - (pieceValues[move.piece] || 10);
  }
  if (['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(move.to)) {
    score += 15;
  }
  if (move.piece !== 'p') score += 10;

  const randomness = difficulty === 'easy' || difficulty === '100' || difficulty === '300' ? 80
    : difficulty === 'medium' || difficulty === '500' || difficulty === '700' ? 40
    : 10;
  return score + Math.floor(Math.random() * randomness);
}

export function chooseBotMove(fen: string, difficulty?: string): BotMove | null;
export function chooseBotMove(fen: string, color: 'w' | 'b', difficulty?: string): BotMove | null;
export function chooseBotMove(
  fen: string,
  colorOrDifficulty: string = 'medium',
  requestedDifficulty: string = 'medium',
): BotMove | null {
  const color = colorOrDifficulty === 'w' || colorOrDifficulty === 'b'
    ? colorOrDifficulty
    : undefined;
  const difficulty = color ? requestedDifficulty : colorOrDifficulty;

  try {
    const chess = new Chess(fen);
    if (color && chess.turn() !== color) return null;

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    for (const move of moves) {
      const positionAfterMove = new Chess(fen);
      positionAfterMove.move(move);
      if (positionAfterMove.isCheckmate()) {
        return { from: move.from, to: move.to, promotion: getPromotion(move.promotion) };
      }
    }

    const bestMove = moves
      .map((move) => ({ move, score: getMoveScore(move, difficulty) }))
      .sort((a, b) => b.score - a.score)[0]?.move;
    if (!bestMove) return null;

    return { from: bestMove.from, to: bestMove.to, promotion: getPromotion(bestMove.promotion) };
  } catch {
    return null;
  }
}

export async function chooseBotMoveAsync(
  fen: string,
  color: 'w' | 'b',
  difficulty: string = 'medium',
  isCancelled: () => boolean = () => false
): Promise<BotMove | null> {
  const chess = new Chess(fen);
  if (chess.turn() !== color) return null;
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0 || isCancelled()) return null;

  const scoredMoves = moves.map((move) => {
    return { move, score: getMoveScore(move, difficulty) };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  const bestMove = scoredMoves[0]?.move || moves[Math.floor(Math.random() * moves.length)];

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: getPromotion(bestMove.promotion),
  };
}
