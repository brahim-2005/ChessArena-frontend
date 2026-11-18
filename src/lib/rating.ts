export type RatingFormat = 'bullet' | 'blitz' | 'rapid' | 'classical';

export function getRatingFormat(timeControl: string): RatingFormat {
  if (timeControl === '1+0') return 'bullet';
  if (timeControl === '3+0' || timeControl === '3+2' || timeControl === '5+0') return 'blitz';
  if (timeControl === '10+0' || timeControl === '10+5') return 'rapid';
  return 'classical';
}

export function applyFixedRating(previous: number, result: 'win' | 'loss' | 'draw'): number {
  if (result === 'draw') return previous;
  if (result === 'win') return Math.max(0, previous + 8);
  return Math.max(0, previous - 8);
}
