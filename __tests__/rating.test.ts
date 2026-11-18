import { applyFixedRating, getRatingFormat } from '../src/lib/rating';

describe('ChessArena fixed player ratings', () => {
  it('starts at 200 and applies +8/-8', () => {
    expect(applyFixedRating(200, 'win')).toBe(208);
    expect(applyFixedRating(208, 'win')).toBe(216);
    expect(applyFixedRating(216, 'loss')).toBe(208);
  });

  it('draw leaves rating unchanged and rating never becomes negative', () => {
    expect(applyFixedRating(208, 'draw')).toBe(208);
    expect(applyFixedRating(4, 'loss')).toBe(0);
  });

  it('separates time controls into four rating formats', () => {
    expect(getRatingFormat('1+0')).toBe('bullet');
    expect(getRatingFormat('3+2')).toBe('blitz');
    expect(getRatingFormat('10+5')).toBe('rapid');
    expect(getRatingFormat('15+10')).toBe('classical');
  });
});
