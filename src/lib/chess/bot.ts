import { chooseBotMoveInCurrentThread } from './botSearch';
import type { BotMove } from './botSearch';

export { chooseBotMove } from './botSearch';
export type { BotDifficulty, BotMove } from './botSearch';

export function chooseBotMoveAsync(
  fen: string,
  color: 'w' | 'b',
  difficulty: string = 'medium',
  isCancelled: () => boolean = () => false
): Promise<BotMove | null> {
  if (typeof Worker === 'undefined') {
    return chooseBotMoveInCurrentThread(fen, color, difficulty, isCancelled);
  }
  return import('./botWorkerClient').then(({ chooseInWorker }) => (
    chooseInWorker(fen, color, difficulty, isCancelled)
  ));
}
