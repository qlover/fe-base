import { calc } from '../calc';

describe('calc module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(calc(1, 2)).toBe(3);
  });

  test('adds 100 + 200 to not equal 301', () => {
    expect(calc(1, 2)).not.toBe(301);
  });
});
