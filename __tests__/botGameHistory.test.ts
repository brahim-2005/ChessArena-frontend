import {
  getBotGameStats,
  getBotGames,
  saveBotGame,
  updateBotGameAnalysis,
  type BotGameRecord,
} from '../src/lib/chess/botGameHistory';

const game: BotGameRecord = {
  id: 'game-1',
  botId: 'beginner',
  botElo: 400,
  format: 'bullet',
  timeControl: '1+0',
  playerColor: 'w',
  result: 'win',
  endReason: 'checkmate',
  playedAt: '2025-01-01T12:00:00.000Z',
  durationSeconds: 30,
  pgn: '1. e4 e5 1-0',
  uciMoves: ['e2e4', 'e7e5'],
  sanMoves: ['e4', 'e5'],
};

beforeEach(() => {
  window.localStorage.clear();
});

describe('local bot game history', () => {
  it('saves games without duplicating an existing game id', () => {
    saveBotGame(game);
    saveBotGame({ ...game, result: 'draw' });

    expect(getBotGames()).toHaveLength(1);
    expect(getBotGames()[0].result).toBe('draw');
  });

  it('computes results separately for each opponent', () => {
    saveBotGame(game);
    saveBotGame({ ...game, id: 'game-2', botId: 'easy', botElo: 700, result: 'loss' });

    expect(getBotGameStats(getBotGames(), 'beginner')).toMatchObject({
      games: 1,
      wins: 1,
      losses: 0,
      draws: 0,
      winRate: 100,
    });
  });

  it('persists engine analysis with the existing game record', () => {
    saveBotGame(game);
    const analysis = {
      accuracy: 94,
      best: 1,
      good: 0,
      inaccuracies: 0,
      mistakes: 0,
      blunders: 0,
      analyzedAt: '2025-01-01T12:01:00.000Z',
      moves: [],
    };

    expect(updateBotGameAnalysis(game.id, analysis).analysis).toEqual(analysis);
    expect(getBotGames()[0].uciMoves).toEqual(game.uciMoves);
  });

  it('reports corrupt saved history rather than silently discarding it', () => {
    window.localStorage.setItem('chessarena:bot-games:v1', '{');
    expect(() => getBotGames()).toThrow('unreadable');
  });
});
