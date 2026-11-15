import { Chess, type Square } from 'chess.js';

export interface Move {
  index: number;
  move: string;
  fen: string;
  from: string;
  to: string;
  color: 'w' | 'b';
  captured?: string;
  promotion?: string;
}

export interface LegalDestination {
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
  capture: boolean;
}

export class GameEngine {
  private chess: Chess;
  private initialFen: string;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.initialFen = this.chess.fen();
  }

  get fen(): string {
    return this.chess.fen();
  }

  get turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  get gameOver(): boolean {
    return this.chess.isCheckmate() || this.chess.isStalemate() || this.chess.isDraw() || this.chess.isInsufficientMaterial();
  }

  get result(): 'white_wins' | 'black_wins' | 'draw' | null {
    if (this.chess.isCheckmate()) return this.chess.turn() === 'w' ? 'black_wins' : 'white_wins';
    if (this.chess.isStalemate() || this.chess.isDraw() || this.chess.isInsufficientMaterial()) return 'draw';
    return null;
  }

  get inCheck(): boolean {
    return this.chess.inCheck();
  }

  get isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  get isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  get isDraw(): boolean {
    return this.chess.isDraw();
  }

  get moveHistory(): Move[] {
    return this.chess.history({ verbose: true }).map((m, i) => ({
      index: i,
      move: m.san,
      fen: this.getFenAtMove(i),
      from: m.from,
      to: m.to,
      color: m.color,
      captured: m.captured,
      promotion: m.promotion,
    }));
  }

  getFenAtMove(moveIndex: number): string {
    const temp = new Chess(this.initialFen);
    const history = this.chess.history({ verbose: true });
    for (let i = 0; i <= moveIndex; i++) {
      temp.move(history[i]);
    }
    return temp.fen();
  }

  getLegalMoves(): string[] {
    return this.chess.moves();
  }

  getLegalMovesForSquare(square: string): string[] {
    return this.chess.moves({ verbose: true })
      .filter(move => move.from === square)
      .map(move => move.san);
  }

  getLegalDestinations(square: string): LegalDestination[] {
    return this.chess.moves({ verbose: true })
      .filter(move => move.from === square)
      .map(move => {
        const promotion = move.promotion;
        return {
          to: move.to,
          promotion: promotion === 'q' || promotion === 'r' || promotion === 'b' || promotion === 'n'
            ? promotion
            : undefined,
          capture: Boolean(move.captured),
        };
      });
  }

  getPieceAt(square: string): { type: string; color: 'w' | 'b' } | null {
    const piece = this.chess.get(square as Square);
    return piece ? { type: piece.type, color: piece.color } : null;
  }

  moveFromSquares(
    from: string,
    to: string,
    promotion: 'q' | 'r' | 'b' | 'n' = 'q'
  ): { success: boolean; move?: Move; error?: string } {
    if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) {
      return { success: false, error: 'Illegal move' };
    }

    try {
      const result = this.chess.move({ from: from as Square, to: to as Square, promotion });
      return {
        success: true,
        move: {
          index: this.chess.history().length - 1,
          move: result.san,
          fen: this.chess.fen(),
          from: result.from,
          to: result.to,
          color: result.color,
          captured: result.captured,
          promotion: result.promotion,
        },
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  move(moveStr: string): { success: boolean; move?: Move; error?: string } {
    try {
      const result = this.chess.move(moveStr);
      if (!result) {
        return { success: false, error: 'Illegal move' };
      }
      return {
        success: true,
        move: {
          index: this.chess.history().length - 1,
          move: result.san,
          fen: this.chess.fen(),
          from: result.from,
          to: result.to,
          color: result.color,
          captured: result.captured,
          promotion: result.promotion,
        },
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  reset(): void {
    this.chess.reset();
    this.initialFen = this.chess.fen();
  }

  undo(): Move | null {
    const undoneMove = this.chess.undo();
    if (!undoneMove) return null;
    return {
      index: this.chess.history().length,
      move: undoneMove.san,
      fen: this.chess.fen(),
      from: undoneMove.from,
      to: undoneMove.to,
      color: undoneMove.color,
      captured: undoneMove.captured,
      promotion: undoneMove.promotion,
    };
  }

  load(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.initialFen = this.chess.fen();
      return true;
    } catch {
      return false;
    }
  }

  getBoard(): (string | null)[][] {
    return this.chess.board().map(row => row.map(piece => piece?.type || null));
  }
}

export function createGame(fen?: string): GameEngine {
  return new GameEngine(fen);
}

export function validateMove(game: GameEngine, moveStr: string): boolean {
  return game.getLegalMoves().includes(moveStr);
}

export function getGameStatus(game: GameEngine): {
  isGameOver: boolean;
  result: string | null;
  inCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
} {
  return {
    isGameOver: game.gameOver,
    result: game.result,
    inCheck: game.inCheck,
    isCheckmate: game.isCheckmate,
    isStalemate: game.isStalemate,
  };
}