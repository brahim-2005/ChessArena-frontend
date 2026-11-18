import { chooseBotMoveInCurrentThread } from './botSearch';
import type { BotMove } from './botSearch';

interface BotWorkerRequest {
  fen: string;
  color: 'w' | 'b';
  difficulty: string;
}

self.onmessage = async (event: MessageEvent<BotWorkerRequest>) => {
  try {
    const move = await chooseBotMoveInCurrentThread(
      event.data.fen,
      event.data.color,
      event.data.difficulty
    );
    self.postMessage({ move } satisfies { move: BotMove | null });
  } catch (error) {
    self.postMessage({
      move: null,
      error: error instanceof Error ? error.message : 'The computer could not calculate a move.',
    });
  }
};
