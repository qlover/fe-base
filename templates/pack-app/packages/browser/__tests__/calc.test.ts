import { calc } from '../src/calc';

describe('calc 函数测试', () => {
  it('应该返回两个数字的和', () => {
    expect(calc(1, 2)).toBe(3);
    expect(calc(-1, 1)).toBe(0);
    expect(calc(0, 0)).toBe(0);
  });
});
