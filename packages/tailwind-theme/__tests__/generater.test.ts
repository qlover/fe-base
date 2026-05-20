import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

const { existsSync, mkdirSync, writeFile } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('fs', () => ({
  default: {
    existsSync,
    mkdirSync,
    promises: { writeFile }
  }
}));

import { generateThemeFile, generateThemeFiles } from '../src/generater';

describe('generateThemeFile', () => {
  const cwd = process.platform === 'win32' ? 'D:\\workspace\\app' : '/workspace/app';

  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(cwd);
    existsSync.mockReset();
    mkdirSync.mockReset();
    writeFile.mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFileExistsOnly = (absolutePath: string) => {
    existsSync.mockImplementation(
      (p: string) => p.replace(/\\/g, '/') !== absolutePath.replace(/\\/g, '/')
    );
  };

  it('writes full theme CSS by default', async () => {
    const outputPath = './theme.css';
    const absolutePath = path.resolve(cwd, outputPath);
    mockFileExistsOnly(absolutePath);

    const result = await generateThemeFile({
      outputPath,
      themes: { light: { 'color-primary': '1 2 3' } },
      defaultTheme: 'light'
    });

    expect(result).toBe(absolutePath);
    const content = writeFile.mock.calls[0][1] as string;
    expect(content).toContain('@layer base {');
    expect(content).toContain('@theme {');
    expect(content).toContain('--fe-color-primary: 1 2 3;');
  });

  it('writes layer-base variant with @layer wrapper only', async () => {
    const outputPath = './layer.css';
    const absolutePath = path.resolve(cwd, outputPath);
    mockFileExistsOnly(absolutePath);

    await generateThemeFile({
      variant: 'layer-base',
      outputPath,
      themes: { light: { 'color-primary': '9 9 9' } },
      defaultTheme: 'light'
    });

    const content = writeFile.mock.calls[0][1] as string;
    expect(content).toContain('@layer base {');
    expect(content).toContain('--fe-color-primary: 9 9 9;');
    expect(content).not.toContain('@theme {');
  });

  it('writes theme-block variant without layer base', async () => {
    const outputPath = './block.css';
    const absolutePath = path.resolve(cwd, outputPath);
    mockFileExistsOnly(absolutePath);

    await generateThemeFile({ variant: 'theme-block', outputPath });

    const content = writeFile.mock.calls[0][1] as string;
    expect(content).toContain('@theme {');
    expect(content).toContain('--color-primary: rgb(var(--fe-color-primary));');
    expect(content).not.toContain('@layer base {');
  });

  it('creates parent directory when missing', async () => {
    const nestedOutput = './out/nested/theme.css';
    const nestedAbsolute = path.resolve(cwd, nestedOutput);
    const nestedDir = path.dirname(nestedAbsolute);

    existsSync.mockImplementation((p: string) => {
      const normalized = p.replace(/\\/g, '/');
      const file = nestedAbsolute.replace(/\\/g, '/');
      const dir = nestedDir.replace(/\\/g, '/');
      if (normalized === file) return false;
      if (normalized === dir) return false;
      return true;
    });

    await generateThemeFile({ outputPath: nestedOutput });

    expect(mkdirSync).toHaveBeenCalledWith(nestedDir, { recursive: true });
  });

  it('warns and overwrites when file exists and overwrite is true', async () => {
    existsSync.mockReturnValue(true);

    await generateThemeFile({ outputPath: './theme.css', overwrite: true });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('File already exists')
    );
    expect(writeFile).toHaveBeenCalled();
  });

  it('throws when file exists and overwrite is false', async () => {
    existsSync.mockReturnValue(true);

    await expect(
      generateThemeFile({ outputPath: './theme.css', overwrite: false })
    ).rejects.toThrow(/overwrite is set to false/);
    expect(writeFile).not.toHaveBeenCalled();
  });
});

describe('generateThemeFiles', () => {
  const cwd = process.platform === 'win32' ? 'D:\\workspace\\app' : '/workspace/app';

  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(cwd);
    existsSync.mockReturnValue(false);
    mkdirSync.mockReset();
    writeFile.mockClear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes all three CSS variants to outputDir', async () => {
    const paths = await generateThemeFiles({ outputDir: 'dist' });

    expect(paths['layer-base']).toBe(path.resolve(cwd, 'dist/theme-layer-base.css'));
    expect(paths['theme-block']).toBe(path.resolve(cwd, 'dist/theme-block.css'));
    expect(paths.full).toBe(path.resolve(cwd, 'dist/theme.css'));
    expect(writeFile).toHaveBeenCalledTimes(3);

    const contents = writeFile.mock.calls.map((call) => call[1] as string);
    expect(contents[0]).toContain('@layer base {');
    expect(contents[0]).not.toContain('@theme {');
    expect(contents[1]).toContain('@theme {');
    expect(contents[1]).not.toContain('@layer base {');
    expect(contents[2]).toContain('@layer base {');
    expect(contents[2]).toContain('@theme {');
  });

  it('respects custom outputPaths per variant', async () => {
    const paths = await generateThemeFiles({
      outputPaths: {
        'layer-base': './custom/layer.css',
        'theme-block': './custom/block.css',
        full: './custom/full.css'
      }
    });

    expect(paths['layer-base']).toBe(path.resolve(cwd, './custom/layer.css'));
    expect(writeFile).toHaveBeenCalledTimes(3);
  });
});
