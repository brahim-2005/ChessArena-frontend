import { Chess } from 'chess.js';

export function isLegalPuzzleSolution(fen: string, moves: string[]): boolean {
  if (moves.length === 0) return false;

  try {
    const chess = new Chess(fen);
    for (const move of moves) {
      chess.move(move);
    }
    return true;
  } catch {
    return false;
  }
}
