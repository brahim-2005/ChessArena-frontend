import { BOT_PROFILES, type BotFormat, type BotProfileId } from '@/lib/chess/botProfiles';

const STORAGE_KEY = 'chessarena:bot-games:v1';

export type BotGameResult = 'win' | 'loss' | 'draw';
export type BotGameEndReason = 'checkmate' | 'draw' | 'timeout';
export type MoveClassification = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface BotMoveAnalysis {
  ply: number;
  color: 'w' | 'b';
  san: string;
  bestMoveUci: string;
  bestMoveSan: string;
  evalBeforeCp: number;
  evalAfterCp: number;
  lossCp: number;
  classification: MoveClassification;
}

export interface BotGameAnalysis {
  accuracy: number;
  best: number;
  good: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  analyzedAt: string;
  moves: BotMoveAnalysis[];
}

export interface BotGameRecord {
  id: string;
  botId: BotProfileId;
  botElo: number;
  format: BotFormat;
  timeControl: string;
  playerColor: 'w' | 'b';
  result: BotGameResult;
  endReason: BotGameEndReason;
  playedAt: string;
  durationSeconds: number;
  pgn: string;
  uciMoves: string[];
  sanMoves: string[];
  analysis?: BotGameAnalysis;
}

export interface BotGameStats {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

const validBotIds = new Set(BOT_PROFILES.map((profile) => profile.id));
const validFormats = new Set<BotFormat>(['bullet', 'blitz', 'rapid', 'classical']);

function isBotGameRecord(value: unknown): value is BotGameRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<BotGameRecord>;
  return typeof record.id === 'string'
    && validBotIds.has(record.botId as BotProfileId)
    && typeof record.botElo === 'number'
    && validFormats.has(record.format as BotFormat)
    && typeof record.timeControl === 'string'
    && (record.playerColor === 'w' || record.playerColor === 'b')
    && (record.result === 'win' || record.result === 'loss' || record.result === 'draw')
    && (record.endReason === 'checkmate' || record.endReason === 'draw' || record.endReason === 'timeout')
    && typeof record.playedAt === 'string'
    && Number.isFinite(Date.parse(record.playedAt))
    && typeof record.durationSeconds === 'number'
    && typeof record.pgn === 'string'
    && Array.isArray(record.uciMoves)
    && record.uciMoves.every((move) => typeof move === 'string')
    && Array.isArray(record.sanMoves)
    && record.sanMoves.every((move) => typeof move === 'string');
}

export function getBotGames(): BotGameRecord[] {
  if (typeof window === 'undefined') return [];
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (serialized === null) return [];

  let records: unknown;
  try {
    records = JSON.parse(serialized);
  } catch {
    throw new Error('Saved computer-game history is unreadable.');
  }
  if (!Array.isArray(records) || !records.every(isBotGameRecord)) {
    throw new Error('Saved computer-game history has an invalid format.');
  }
  return records;
}

export function saveBotGame(record: BotGameRecord): void {
  if (typeof window === 'undefined') {
    throw new Error('Computer-game history can only be saved in a browser.');
  }
  const records = getBotGames();
  const updatedRecords = [
    record,
    ...records.filter((existing) => existing.id !== record.id),
  ].sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
}

export function updateBotGameAnalysis(id: string, analysis: BotGameAnalysis): BotGameRecord {
  const records = getBotGames();
  const record = records.find((game) => game.id === id);
  if (!record) {
    throw new Error('The selected computer game is no longer in saved history.');
  }
  const updatedRecord = { ...record, analysis };
  saveBotGame(updatedRecord);
  return updatedRecord;
}

export function getBotGameStats(
  records: readonly BotGameRecord[],
  botId?: BotProfileId,
): BotGameStats {
  const filteredRecords = botId ? records.filter((record) => record.botId === botId) : records;
  const wins = filteredRecords.filter((record) => record.result === 'win').length;
  const losses = filteredRecords.filter((record) => record.result === 'loss').length;
  const draws = filteredRecords.filter((record) => record.result === 'draw').length;
  const games = filteredRecords.length;
  return {
    games,
    wins,
    losses,
    draws,
    winRate: games === 0 ? 0 : Math.round((wins / games) * 100),
  };
}
