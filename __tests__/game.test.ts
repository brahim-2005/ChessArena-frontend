import { GameEngine, createGame, validateMove } from '../src/lib/chess/game';
import { chooseBotMove, chooseBotMoveAsync } from '../src/lib/chess/bot';
import { isLegalPuzzleSolution } from '../src/lib/chess/puzzleValidation';

describe('GameEngine', () => {
  describe('local chess bot', () => {
    it.each(['easy', 'medium', 'hard'] as const)('returns a legal %s move', (difficulty) => {
      const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
      const move = chooseBotMove(position, 'b', difficulty);
      expect(move).not.toBeNull();
      if (!move) return;
      expect(new GameEngine(position).moveFromSquares(move.from, move.to, move.promotion).success).toBe(true);
    });

    it('replays move history from a custom starting position', () => {
      const game = new GameEngine('7k/P7/8/8/8/8/8/7K w - - 0 1');
      game.moveFromSquares('a7', 'a8', 'n');
      expect(game.moveHistory[0].fen).toContain('N6k');
    });

    it('does not move out of turn or after the game is over', () => {
      expect(chooseBotMove(createGame().fen, 'b', 'easy')).toBeNull();
      expect(chooseBotMove('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1', 'b', 'easy')).toBeNull();
    });

    it('finds a checkmating move when one is available', () => {
      const position = '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1';
      const move = chooseBotMove(position, 'w', 'hard');
      expect(move).not.toBeNull();
      if (!move) return;
      const game = new GameEngine(position);
      expect(game.moveFromSquares(move.from, move.to, move.promotion).success).toBe(true);
      expect(game.isCheckmate).toBe(true);
    });

    it('uses the advanced search to take a free rook', async () => {
      const position = 'k7/8/8/8/8/8/6r1/4K2Q w - - 0 1';
      const move = await chooseBotMoveAsync(position, 'w', 'advanced');
      expect(move).toMatchObject({ from: 'h1', to: 'g2' });
    });

    it('keeps all three named difficulty settings legal', async () => {
      const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
      for (const difficulty of ['easy', 'intermediate', 'advanced']) {
        const move = await chooseBotMoveAsync(position, 'b', difficulty);
        expect(move).not.toBeNull();
        if (move) {
          expect(new GameEngine(position).moveFromSquares(move.from, move.to, move.promotion).success).toBe(true);
        }
      }
    });

    it('can cancel a computer search between candidate moves', async () => {
      const move = await chooseBotMoveAsync(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1',
        'b',
        'hard',
        () => true
      );
      expect(move).toBeNull();
    });

    it('returns a legal move from the asynchronous search', async () => {
      const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
      const move = await chooseBotMoveAsync(position, 'b', 'easy');
      expect(move).not.toBeNull();
      if (!move) return;
      expect(new GameEngine(position).moveFromSquares(move.from, move.to, move.promotion).success).toBe(true);
    });
  });

  it('should initialize with standard starting FEN', () => {
    const game = createGame();
    expect(game.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  describe('isLegalPuzzleSolution', () => {
    const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    it('accepts a legal sequence of solution moves', () => {
      expect(isLegalPuzzleSolution(startingPosition, ['e4', 'e5', 'Nf3', 'Nc6'])).toBe(true);
    });

    it.each([
      { fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1', moves: ['Qg7#'] },
      { fen: '6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1', moves: ['Qa8#'] },
    ])('accepts the seeded mate-in-one puzzle solution', ({ fen, moves }) => {
      expect(isLegalPuzzleSolution(fen, moves)).toBe(true);
    });

    it('rejects an illegal sequence and empty solutions', () => {
      expect(isLegalPuzzleSolution(startingPosition, ['e4', 'e5', 'e5'])).toBe(false);
      expect(isLegalPuzzleSolution(startingPosition, [])).toBe(false);
    });
  });

  it('should make legal moves', () => {
    const game = createGame();
    const result = game.move('e4');
    expect(result.success).toBe(true);
    expect(game.turn).toBe('b');
  });

  it('should make legal moves from board squares', () => {
    const game = createGame();
    const result = game.moveFromSquares('e2', 'e4');
    expect(result.success).toBe(true);
    expect(game.turn).toBe('b');
  });

  it('lists legal destinations and supports click-to-move board input', () => {
    const game = createGame();
    expect(game.getLegalDestinations('e2').map((move) => move.to)).toEqual(['e3', 'e4']);
    expect(game.moveFromSquares('e2', 'e4').success).toBe(true);
    expect(game.moveHistory[0]).toMatchObject({ move: 'e4', from: 'e2', to: 'e4', color: 'w' });
  });

  it('supports castling, en passant, and all promotion choices', () => {
    const castlingGame = new GameEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(castlingGame.moveFromSquares('e1', 'g1').success).toBe(true);
    expect(castlingGame.fen).toContain('R4RK1');

    const enPassantGame = new GameEngine('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    expect(enPassantGame.getLegalDestinations('e5')).toContainEqual({ to: 'd6', capture: true, promotion: undefined });
    expect(enPassantGame.moveFromSquares('e5', 'd6').success).toBe(true);
    expect(enPassantGame.getPieceAt('d5')).toBeNull();

    const promotionGame = new GameEngine('7k/P7/8/8/8/8/8/7K w - - 0 1');
    expect(promotionGame.getLegalDestinations('a7').filter((move) => move.to === 'a8')).toHaveLength(4);
    expect(promotionGame.moveFromSquares('a7', 'a8', 'n').success).toBe(true);
    expect(promotionGame.getPieceAt('a8')).toEqual({ type: 'n', color: 'w' });
  });

  it('undoes the previous move and restores its position', () => {
    const game = createGame();
    game.moveFromSquares('e2', 'e4');
    expect(game.undo()?.move).toBe('e4');
    expect(game.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(game.undo()).toBeNull();
  });

  it('should reject illegal moves from board squares', () => {
    const game = createGame();
    const result = game.moveFromSquares('e2', 'e5');
    expect(result.success).toBe(false);
    expect(game.turn).toBe('w');
  });

  it('should reject illegal moves', () => {
    const game = createGame();
    const result = game.move('e5');
    expect(result.success).toBe(false);
  });

  it('should detect check', () => {
    const game = new GameEngine('rnb1kbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    // Scholar's mate sequence or similar test
    expect(game.inCheck).toBe(false);
  });

  it('should validate moves correctly', () => {
    const game = createGame();
    expect(validateMove(game, 'e4')).toBe(true);
    expect(validateMove(game, 'e5')).toBe(false);
  });
});