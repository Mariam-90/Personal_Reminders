import { dailyCounts, summary } from './stats';

const now = new Date(2026, 9, 15, 20, 0);
const day = (offset, h = 9) => new Date(2026, 9, 15 + offset, h, 0);
const done = (offset) => ({ executionDate: day(offset), isCompleted: true, completionDate: day(offset, 9) });
const missed = (offset) => ({ executionDate: day(offset), isCompleted: false });

describe('dailyCounts', () => {
  it('counts done and missed per day, oldest first', () => {
    const week = dailyCounts([done(0), missed(0), done(-1), missed(-10)], now, 7);
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ done: 1, missed: 1 });
    expect(week[5]).toMatchObject({ done: 1, missed: 0 });
  });
});

describe('summary', () => {
  it('computes the success rate and the streak', () => {
    const s = summary([done(0), done(-1), done(-2), missed(-3)], now);
    expect(s.done).toBe(3);
    expect(s.missed).toBe(1);
    expect(s.rate).toBe(75);
    expect(s.streak).toBe(3);
  });

  it('has no rate without data', () => {
    expect(summary([], now).rate).toBeNull();
  });
});
