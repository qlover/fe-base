import { sum } from '../src/sum';

describe('sum 函数测试', () => {
  it('应该返回两个数字的和', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
});
