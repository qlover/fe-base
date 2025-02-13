import { expect, describe, it, beforeAll, afterAll } from 'vitest';
import { readJson } from '../src/readJson';
import { writeFileSync, unlinkSync } from 'fs';

describe('readJson 函数测试', () => {
  const testFilePath = './test.json';

  beforeAll(() => {
    // 创建一个测试文件
    writeFileSync(testFilePath, JSON.stringify({ key: 'value' }));
  });

  afterAll(() => {
    // 删除测试文件
    unlinkSync(testFilePath);
  });

  it('应该正确读取 JSON 文件', () => {
    const result = readJson(testFilePath);
    expect(result).toEqual({ key: 'value' });
  });

  it('应该抛出错误当文件不存在时', () => {
    expect(() => readJson('./nonexistent.json')).toThrow();
  });
});
