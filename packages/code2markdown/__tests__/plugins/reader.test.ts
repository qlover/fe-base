/**
 * Reader plugin test suite
 *
 * Coverage:
 * 1. constructor     - Constructor initialization
 * 2. onBefore       - Main execution method
 * 3. getEntryAllFiles - File collection from entries
 * 4. getAllFilePaths  - Recursive file path collection
 * 5. error handling  - Invalid paths and file operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Reader } from '../../src/plugins/reader';
import Code2MDContext from '../../src/implments/Code2MDContext';
import { mkdirSync, writeFileSync, rmSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    readdirSync: vi.fn(actual.readdirSync)
  };
});

describe('Reader', () => {
  let TEST_DIR: string;
  let context: Code2MDContext;
  let reader: Reader;

  // Test file structure setup
  beforeEach(() => {
    // Create unique test directory for each test
    TEST_DIR = join(
      tmpdir(),
      'code2markdown-test-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2)
    );
    // Create test directory structure
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'src'), { recursive: true });
    mkdirSync(join(TEST_DIR, 'src/components'), { recursive: true });

    // Create test files
    writeFileSync(join(TEST_DIR, 'src/index.ts'), 'export const test = 1;');
    writeFileSync(
      join(TEST_DIR, 'src/components/Button.ts'),
      'export class Button {}'
    );
    writeFileSync(
      join(TEST_DIR, 'src/components/Input.ts'),
      'export class Input {}'
    );

    // Initialize context and reader
    context = new Code2MDContext('code2markdown', {
      options: {
        sourcePath: join(TEST_DIR, 'src'),
        generatePath: join(TEST_DIR, 'docs')
      }
    });
    reader = new Reader(context);

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  // Cleanup test files
  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true, maxRetries: 3 });
    }
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid context', () => {
      expect(reader).toBeInstanceOf(Reader);
      expect(reader['context']).toBe(context);
    });

    it('should throw error with invalid context', () => {
      expect(
        () => new Reader(undefined as unknown as Code2MDContext)
      ).toThrow();
    });
  });

  describe('onBefore', () => {
    it('should process source directory and update context', async () => {
      await reader.onBefore();
      const { readerOutputs } = context.options;

      expect(readerOutputs).toBeDefined();
      expect(readerOutputs?.length).toBe(3); // index.ts, Button.ts, Input.ts

      // Verify output structure
      const indexOutput = readerOutputs?.find(
        (output) => output.name === 'index'
      );
      expect(indexOutput).toBeDefined();
      expect(indexOutput?.ext).toBe('.ts');
      expect(indexOutput?.outputPath).toContain('index.md');
    });

    it('should handle empty source directory', async () => {
      // Create empty directory
      const emptyDir = join(TEST_DIR, 'empty');
      mkdirSync(emptyDir, { recursive: true });

      context = new Code2MDContext('code2markdown', {
        options: {
          sourcePath: emptyDir,
          generatePath: join(TEST_DIR, 'docs')
        }
      });
      reader = new Reader(context);

      await reader.onBefore();
      expect(context.options.readerOutputs).toEqual([]);
    });

    it('should throw error with invalid source path', async () => {
      context = new Code2MDContext('code2markdown', {
        options: {
          sourcePath: './non-existent-path',
          generatePath: join(TEST_DIR, 'docs')
        }
      });
      reader = new Reader(context);

      await expect(reader.onBefore()).rejects.toThrow();
    });
  });

  describe('getEntryAllFiles', () => {
    it('should collect files from single file entry', () => {
      const filePath = join(TEST_DIR, 'src/index.ts');
      const files = reader['getEntryAllFiles']([filePath]);

      expect(files).toContain(filePath);
      expect(files.length).toBe(3); // Should get all files in src/
    });

    it('should collect files from directory entry', () => {
      const dirPath = join(TEST_DIR, 'src/components');
      const files = reader['getEntryAllFiles']([dirPath]);

      expect(files.length).toBe(2); // Button.ts and Input.ts
      expect(files.some((file) => file.includes('Button.ts'))).toBe(true);
      expect(files.some((file) => file.includes('Input.ts'))).toBe(true);
    });

    it('should handle multiple entries', () => {
      const entries = [
        join(TEST_DIR, 'src/index.ts'),
        join(TEST_DIR, 'src/components')
      ];
      const files = reader['getEntryAllFiles'](entries);

      expect(files.length).toBe(3); // All files
      expect(new Set(files).size).toBe(3); // No duplicates
    });
  });

  describe('getAllFilePaths', () => {
    it('should recursively collect all file paths', () => {
      const files = reader['getAllFilePaths'](join(TEST_DIR, 'src'));

      expect(files.size).toBe(3);
      expect(Array.from(files).some((file) => file.includes('index.ts'))).toBe(
        true
      );
      expect(Array.from(files).some((file) => file.includes('Button.ts'))).toBe(
        true
      );
      expect(Array.from(files).some((file) => file.includes('Input.ts'))).toBe(
        true
      );
    });

    it('should handle empty directories', () => {
      const emptyDir = join(TEST_DIR, 'empty');
      mkdirSync(emptyDir, { recursive: true });

      const files = reader['getAllFilePaths'](emptyDir);
      expect(files.size).toBe(0);
    });

    it('should maintain unique file paths', () => {
      const existingPaths = new Set<string>();
      existingPaths.add(join(TEST_DIR, 'src/index.ts'));

      const files = reader['getAllFilePaths'](
        join(TEST_DIR, 'src'),
        existingPaths
      );
      expect(files.size).toBe(3); // Should add only new files
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', () => {
      const invalidPath = './invalid-path';
      expect(() => reader['getAllFilePaths'](invalidPath)).toThrow();
    });

    it('should handle permission errors', () => {
      // Mock readdirSync to simulate permission error
      (
        readdirSync as unknown as ReturnType<typeof vi.fn>
      ).mockImplementationOnce(() => {
        throw new Error('EACCES: permission denied');
      });

      expect(() => reader['getAllFilePaths'](TEST_DIR)).toThrow(
        'permission denied'
      );
    });
  });
});
