import { describe, it, expect, vi } from 'vitest';
import { QuickerTime } from '../../src/core/storage/QuickerTime';

const qt = new QuickerTime();
const BASE = Date.UTC(2025, 0, 1, 0, 0, 0, 0); // 2025-01-01 00:00:00 UTC

describe('QuickerTime.add', () => {
  it('supports millisecond / second / minute / hour / day / week', () => {
    expect(qt.add('millisecond', 500, BASE)).toBe(BASE + 500);
    expect(qt.add('second', 30, BASE)).toBe(BASE + 30 * 1_000);
    expect(qt.add('minute', 2, BASE)).toBe(BASE + 2 * 60_000);
    expect(qt.add('hour', 1, BASE)).toBe(BASE + 3_600_000);
    expect(qt.add('day', 2, BASE)).toBe(BASE + 2 * 86_400_000);
    expect(qt.add('week', 1, BASE)).toBe(BASE + 7 * 86_400_000);
  });

  it('supports month & year (Date roll-over)', () => {
    const addMonth = (() => {
      const d = new Date(BASE);
      d.setMonth(d.getMonth() + 1);
      return d.getTime();
    })();
    const addYear = (() => {
      const d = new Date(BASE);
      d.setFullYear(d.getFullYear() + 3);
      return d.getTime();
    })();

    expect(qt.add('month', 1, BASE)).toBe(addMonth);
    expect(qt.add('year', 3, BASE)).toBe(addYear);
  });

  it('defaults value = 1 & timestamp = Date.now()', () => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
    const expected = BASE + 86_400_000; // +1 day
    expect(qt.add('day')).toBe(expected);
    vi.useRealTimers();
  });
});

describe('QuickerTime.subtract', () => {
  it('returns symmetric negative values', () => {
    expect(qt.subtract('second', 45, BASE)).toBe(qt.add('second', -45, BASE));
    expect(qt.subtract('month', 2, BASE)).toBe(qt.add('month', -2, BASE));
  });
});
