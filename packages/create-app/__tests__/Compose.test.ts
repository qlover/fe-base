import { Compose } from '../src/Compose';
import * as fs from 'fs';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import path from 'path';

describe('Compose 类测试', () => {
  const testDir = './test-files';
  const jsonFilePath = path.join(testDir, 'test.json');
  const templateFilePath = path.join(testDir, 'test.template');
  const compose = new Compose();

  beforeAll(() => {
    // 创建测试目录和文件
    if (!existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    writeFileSync(jsonFilePath, JSON.stringify({ key: 'value' }));
    writeFileSync(templateFilePath, 'Hello [TPL:name]!');
  });

  afterAll(() => {
    // 删除测试文件
    unlinkSync(jsonFilePath);
    unlinkSync(templateFilePath);
    fs.rmdirSync(testDir);
  });

  it('应该正确识别 JSON 文件路径', () => {
    expect(compose.isJSONFilePath(jsonFilePath)).toBe(true);
    expect(compose.isJSONFilePath(templateFilePath)).toBe(false);
  });

  it('应该正确识别模板文件路径', () => {
    expect(compose.isTemplateFilePath(templateFilePath)).toBe(true);
    expect(compose.isTemplateFilePath(jsonFilePath)).toBe(false);
  });

  it('应该替换模板文件中的占位符', () => {
    const context = { name: 'World' };
    const result = compose.replaceFile(templateFilePath, context);
    expect(result).toBe('Hello World!');
  });

  it('应该合并 JSON 文件内容', () => {
    const sourceContent = { newKey: 'newValue' };
    compose.mergeJSONFile(jsonFilePath, sourceContent);
    const mergedContent = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    expect(mergedContent).toEqual({ key: 'value', newKey: 'newValue' });
  });
});
