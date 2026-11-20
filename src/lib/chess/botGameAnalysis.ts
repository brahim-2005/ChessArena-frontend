import { Chess } from 'chess.js';
import { getBotProfile } from '@/lib/chess/botProfiles';
import {
  type BotGameAnalysis,
  type BotGameRecord,
  type BotMoveAnalysis,
  type MoveClassification,
} from '@/lib/chess/botGameHistory';
import { getStockfishClient, type StockfishProgress } from '@/lib/chess/stockfishClient';

function parseUciMove(move: string): { from: string; to: string; promotion?: string } {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(move);
  if (!match) throw new Error(`Invalid move in saved game: ${move}.`);
  return { from: match[1], to: match[2], promotion: match[3] };
}

function classifyMove(lossCp: number): MoveClassification {
  if (lossCp <= 20) return 'best';
  if (lossCp <= 50) return 'good';
  if (lossCp <= 100) return 'inaccuracy';
  if (lossCp <= 200) return 'mistake';
  return 'blunder';
}

export async function analyzeBotGame(
  record: BotGameRecord,
  onProgress?: (completed: number, total: number) => void,
  onEngineProgress?: (progress: StockfishProgress) => void,
): Promise<BotGameAnalysis> {
  const engine = await getStockfishClient(onEngineProgress);
  const fullStrengthProfile = getBotProfile('super-grandmaster');
  if (!fullStrengthProfile) throw new Error('The full-strength Stockfish profile is unavailable.');
  await engine.configure(fullStrengthProfile, true);

  const chess = new Chess();
  const moves: BotMoveAnalysis[] = [];
  const total = record.uciMoves.length;
  onProgress?.(0, total);

  for (let index = 0; index < total; index += 1) {
    const uciMove = record.uciMoves[index];
    const before = await engine.search(chess.fen(), 150);
    if (!before) throw new Error('Stockfish stopped before the game analysis completed.');

    const parsedBestMove = parseUciMove(before.bestMove);
    const bestPosition = new Chess(chess.fen());
    const bestMove = bestPosition.move({
      from: parsedBestMove.from,
      to: parsedBestMove.to,
      promotion: parsedBestMove.promotion,
    });
    if (!bestMove) {
      throw new Error(`Stockfish returned an illegal analysis move: ${before.bestMove}.`);
    }

    const parsedPlayedMove = parseUciMove(uciMove);
    const playedMove = chess.move({
      from: parsedPlayedMove.from,
      to: parsedPlayedMove.to,
      promotion: parsedPlayedMove.promotion,
    });
    if (!playedMove) throw new Error(`Saved game contains an illegal move: ${uciMove}.`);

    let evalAfterCp = 0;
    if (chess.isCheckmate()) {
      evalAfterCp = 10_000;
    } else if (!chess.isGameOver()) {
      const after = await engine.search(chess.fen(), 150);
      if (!after) throw new Error('Stockfish stopped before the game analysis completed.');
      evalAfterCp = -after.scoreCp;
    }

    const lossCp = Math.max(0, before.scoreCp - evalAfterCp);
    moves.push({
      ply: index + 1,
      color: playedMove.color,
      san: playedMove.san,
      bestMoveUci: before.bestMove,
      bestMoveSan: bestMove.san,
      evalBeforeCp: before.scoreCp,
      evalAfterCp,
      lossCp,
      classification: classifyMove(lossCp),
    });
    onProgress?.(index + 1, total);
  }

  const playerMoves = moves.filter((move) => move.color === record.playerColor);
  const averageLoss = playerMoves.length === 0
    ? 0
    : playerMoves.reduce((sum, move) => sum + move.lossCp, 0) / playerMoves.length;

  return {
    accuracy: Math.round(Math.max(0, 100 - averageLoss / 10)),
    best: playerMoves.filter((move) => move.classification === 'best').length,
    good: playerMoves.filter((move) => move.classification === 'good').length,
    inaccuracies: playerMoves.filter((move) => move.classification === 'inaccuracy').length,
    mistakes: playerMoves.filter((move) => move.classification === 'mistake').length,
    blunders: playerMoves.filter((move) => move.classification === 'blunder').length,
    analyzedAt: new Date().toISOString(),
    moves,
  };
}
