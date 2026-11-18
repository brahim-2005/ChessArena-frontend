import type { BotMove } from './botSearch';

interface BotWorkerRequest {
  fen: string;
  color: 'w' | 'b';
  difficulty: string;
}

interface BotWorkerResponse {
  move: BotMove | null;
  error?: string;
}

export function chooseInWorker(
  fen: string,
  color: 'w' | 'b',
  difficulty: string,
  isCancelled: () => boolean
): Promise<BotMove | null> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./bot.worker.ts', import.meta.url), { type: 'module' });
    let settled = false;
    const cancellationTimer = setInterval(() => {
      if (isCancelled()) finish(null);
    }, 25);

    function finish(move: BotMove | null) {
      if (settled) return;
      settled = true;
      clearInterval(cancellationTimer);
      worker.terminate();
      resolve(move);
    }

    worker.onmessage = (event: MessageEvent<BotWorkerResponse>) => {
      if (event.data.error) {
        if (settled) return;
        settled = true;
        clearInterval(cancellationTimer);
        worker.terminate();
        reject(new Error(event.data.error));
        return;
      }
      finish(event.data.move);
    };

    worker.onerror = (event) => {
      event.preventDefault();
      if (settled) return;
      settled = true;
      clearInterval(cancellationTimer);
      worker.terminate();
      reject(new Error(event.message || 'The computer worker failed.'));
    };

    if (isCancelled()) {
      finish(null);
      return;
    }
    const request: BotWorkerRequest = { fen, color, difficulty };
    worker.postMessage(request);
  });
}
