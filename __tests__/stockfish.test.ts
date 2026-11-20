import {
  BOT_PROFILES,
  getBotThinkingTimeMs,
  getBotUciSettings,
  parseUciOption,
} from '../src/lib/chess/botProfiles';
import { StockfishClient } from '../src/lib/chess/stockfishClient';
import { validateStockfishMove } from '../src/lib/chess/stockfishBot';

class FakeStockfishWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  commands: string[] = [];

  postMessage(command: string): void {
    this.commands.push(command);
    if (command === 'uci') {
      queueMicrotask(() => {
        this.emit('option name UCI_LimitStrength type check default false');
        this.emit('option name UCI_Elo type spin default 1320 min 1320 max 3190');
        this.emit('option name Skill Level type spin default 20 min 0 max 20');
        this.emit('option name Hash type spin default 16 min 1 max 33554432');
        this.emit('uciok');
      });
    } else if (command === 'isready') {
      queueMicrotask(() => this.emit('readyok'));
    } else if (command.startsWith('go ')) {
      queueMicrotask(() => {
        this.emit('info depth 10 score cp 24 pv e2e4');
        this.emit('bestmove e2e4');
      });
    }
  }

  terminate(): void {}

  private emit(line: string): void {
    this.onmessage?.(new MessageEvent('message', { data: line }));
  }
}

describe('Stockfish opponent configuration', () => {
  it('exposes exactly the nine requested rating tiers', () => {
    expect(BOT_PROFILES.map(({ elo }) => elo)).toEqual([
      400, 700, 1000, 1300, 1600, 1900, 2200, 2600, 3000,
    ]);
  });

  it('uses Skill Level for targets below Stockfish UCI_Elo minimum', () => {
    const option = parseUciOption('option name UCI_Elo type spin default 1320 min 1320 max 3190');
    expect(option).toEqual({ name: 'UCI_Elo', min: 1320, max: 3190 });
    expect(getBotUciSettings(BOT_PROFILES[0], [option!])).toEqual({
      limitStrength: false,
      elo: null,
      skillLevel: 0,
    });
  });

  it('applies Elo limiting for supported tiers and leaves the top tier unrestricted', () => {
    const options = [{ name: 'UCI_Elo', min: 1320, max: 3190 }];
    expect(getBotUciSettings(BOT_PROFILES[4], options)).toEqual({
      limitStrength: true,
      elo: 1600,
      skillLevel: 20,
    });
    expect(getBotUciSettings(BOT_PROFILES[8], options)).toEqual({
      limitStrength: false,
      elo: null,
      skillLevel: 20,
    });
  });

  it('uses progressively longer thinking budgets for slower formats', () => {
    expect(getBotThinkingTimeMs(BOT_PROFILES[8], 'bullet'))
      .toBeLessThan(getBotThinkingTimeMs(BOT_PROFILES[8], 'blitz'));
    expect(getBotThinkingTimeMs(BOT_PROFILES[8], 'rapid'))
      .toBeLessThan(getBotThinkingTimeMs(BOT_PROFILES[8], 'classical'));
  });

  it('waits for UCI readiness, configures Elo, and returns engine search output', async () => {
    const worker = new FakeStockfishWorker();
    const client = new StockfishClient(() => worker);
    await client.configure(BOT_PROFILES[4]);
    const result = await client.search(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      100,
    );

    expect(worker.commands).toContain('setoption name UCI_Elo value 1600');
    expect(worker.commands).toContain('setoption name UCI_LimitStrength value true');
    expect(worker.commands).toContain('go movetime 100');
    expect(result).toMatchObject({ bestMove: 'e2e4', scoreCp: 24, depth: 10 });
  });

  it('rejects illegal Stockfish moves instead of applying them', () => {
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(validateStockfishMove(startingFen, 'w', 'e2e4')).toEqual({
      from: 'e2',
      to: 'e4',
      promotion: undefined,
    });
    expect(() => validateStockfishMove(startingFen, 'w', 'e2e5')).toThrow('illegal move');
  });
});
