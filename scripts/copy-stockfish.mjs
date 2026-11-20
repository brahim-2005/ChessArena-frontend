import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packageDirectory = resolve(process.cwd(), 'node_modules', 'stockfish');
const outputDirectory = resolve(process.cwd(), 'public', 'stockfish');

await mkdir(outputDirectory, { recursive: true });

for (const filename of [
  'stockfish-19-single.js',
  'stockfish-19-single.wasm',
  'Copying.txt',
]) {
  const sourceFilename = filename === 'Copying.txt' ? filename : `bin/${filename}`;
  await copyFile(
    resolve(packageDirectory, sourceFilename),
    resolve(outputDirectory, filename),
  );
}

await writeFile(
  resolve(outputDirectory, 'NOTICE.txt'),
  [
    'Stockfish.js 19.0.1 full single-threaded engine',
    'Copyright and license details are in Copying.txt.',
    'License: GNU General Public License, version 3 (GPL-3.0).',
    'Source: https://github.com/nmrugg/stockfish.js/tree/v19.0.1',
    'The ChessArena application code is not part of Stockfish.js.',
    '',
  ].join('\n'),
  'utf8',
);
