import * as fs from 'fs';
import * as path from 'path';
import { Copyer } from '../src/Copyer';
import { Util } from '../src/Util';

jest.mock('../src/Util');

describe('Copyer 类测试', () => {
  const sourceDir = './source-files';
  const targetDir = './target-files';
  const ignoreFilePath = path.join(sourceDir, '.gitignore.template');

  beforeAll(() => {
    // 创建测试目录和文件
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir);
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    fs.writeFileSync(path.join(sourceDir, 'file1.txt'), 'Hello World');
    fs.writeFileSync(path.join(sourceDir, 'file2.txt'), 'Hello Again');
    fs.writeFileSync(ignoreFilePath, 'file2.txt\n');
  });

  afterAll(() => {
    // 删除测试文件和目录
    fs.rmSync(sourceDir, { recursive: true, force: true });
    fs.rmSync(targetDir, { recursive: true, force: true });
  });

  it('getIg 方法应该返回 ignore 实例', () => {
    const copyer = new Copyer(sourceDir);
    const ig = copyer.getIg();
    expect(typeof ig?.ignores).toBe('function');
    expect(ig?.ignores('file2.txt')).toBe(true);
  });

  it('getIg 方法应该返回 undefined 如果没有 ignore 文件', () => {
    const copyer = new Copyer(targetDir);
    const ig = copyer.getIg();
    expect(ig).toBeUndefined();
  });

  it('copyFiles 方法应该复制文件并忽略 .gitignore 中的文件', async () => {
    const copyer = new Copyer(sourceDir);
    const ig = copyer.getIg();
    await copyer.copyFiles(sourceDir, targetDir, ig);

    expect(fs.existsSync(path.join(targetDir, 'file1.txt'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'file2.txt'))).toBe(false);
  });

  it('copyPaths 方法应该调用 Util.ensureDir 来确保目标目录存在', async () => {
    const copyer = new Copyer(sourceDir);
    await copyer.copyPaths({ sourcePath: sourceDir, targetPath: targetDir });

    expect(Util.ensureDir).toHaveBeenCalledWith(targetDir);
  });

  it('copyPaths 方法应该复制文件', async () => {
    const copyer = new Copyer(sourceDir);
    await copyer.copyPaths({ sourcePath: sourceDir, targetPath: targetDir });

    expect(fs.existsSync(path.join(targetDir, 'file1.txt'))).toBe(true);
  });
});
