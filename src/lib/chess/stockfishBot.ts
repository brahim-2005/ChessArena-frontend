import { Chess } from 'chess.js';
import {
  getBotProfile,
  getBotThinkingTimeMs,
  type BotFormat,
  type BotProfileId,
} from '@/lib/chess/botProfiles';
import { getStockfishClient, type StockfishProgress } from '@/lib/chess/stockfishClient';
import type { BotMove } from '@/lib/chess/bot';

export interface StockfishMoveOptions {
  fen: string;
  color: 'w' | 'b';
  profileId: BotProfileId;
  format: BotFormat;
  moveHistory?: readonly string[];
  isCancelled?: () => boolean;
  onProgress?: (progress: StockfishProgress) => void;
}

export function validateStockfishMove(fen: string, color: 'w' | 'b', uciMove: string): BotMove {
  const chess = new Chess(fen);
  if (chess.turn() !== color || chess.isGameOver()) {
    throw new Error('Stockfish returned a move for a position that is no longer active.');
  }
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uciMove);
  if (!match) throw new Error(`Stockfish returned an invalid move: ${uciMove}.`);

  const [from, to, promotion] = match.slice(1);
  const legalMove = chess.moves({ verbose: true }).find((move) =>
    move.from === from
    && move.to === to
    && (move.promotion ?? undefined) === (promotion ?? undefined),
  );
  if (!legalMove) throw new Error(`Stockfish returned an illegal move: ${uciMove}.`);
  return {
    from: legalMove.from,
    to: legalMove.to,
    promotion: legalMove.promotion === 'q'
      || legalMove.promotion === 'r'
      || legalMove.promotion === 'b'
      || legalMove.promotion === 'n'
      ? legalMove.promotion
      : undefined,
  };
}

export async function chooseStockfishMove(
  options: StockfishMoveOptions,
): Promise<BotMove | null> {
  const chess = new Chess(options.fen);
  if (chess.turn() !== options.color || chess.isGameOver()) return null;
  if (options.isCancelled?.()) return null;

  const profile = getBotProfile(options.profileId);
  if (!profile) {
    throw new Error(`Unknown computer opponent: ${options.profileId}.`);
  }

  const client = await getStockfishClient(options.onProgress);
  if (options.isCancelled?.()) return null;
  await client.configure(profile);
  const result = await client.search(
    options.fen,
    getBotThinkingTimeMs(profile, options.format),
    options.isCancelled,
    options.moveHistory,
  );
  if (!result || options.isCancelled?.()) return null;
  return validateStockfishMove(options.fen, options.color, result.bestMove);
}
