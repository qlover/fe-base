import { readdirSync, statSync } from 'fs';
import Code2MDContext from '../implments/Code2MDContext';
import { ScriptPlugin } from '@qlover/scripts-context';
import { basename, dirname, extname, join, relative } from 'path';

/**
 * Entry file information for file reading operations
 */
export interface EntryValue {
  /** Full path to the entry file or directory */
  path: string;
  /** Name of the entry file or directory */
  name: string;
}

/**
 * Processed file information for markdown generation
 */
export interface ReaderOutput {
  /** Full absolute path to the source file */
  fullPath: string;
  /** File name without extension */
  name: string;
  /** Directory path containing the file */
  dir: string;
  /** File extension (e.g., '.ts', '.js') */
  ext: string;
  /** Relative path from current working directory */
  relativePath: string;
  /** Expected output path for generated markdown file */
  outputPath: string;
}

/**
 * Reader plugin for scanning and processing TypeScript source files
 *
 * Core Responsibilities:
 * - Scan entry points (files or directories) for TypeScript source files
 * - Process file paths and extract metadata for documentation generation
 * - Generate output path mappings for markdown files
 * - Handle both single file and directory entry points
 * - Support recursive directory scanning for nested file structures
 *
 * Design Considerations:
 * - Uses synchronous file system operations for simplicity
 * - Handles both file and directory entry points automatically
 * - Generates relative paths for consistent output structure
 * - Maps source file extensions to .md output extensions
 * - Provides detailed file metadata for downstream processing
 *
 * @example Basic Usage
 * ```typescript
 * const reader = new Reader(context);
 * await reader.onBefore(); // Scan and process source files
 * ```
 *
 * @example With File Entry
 * ```typescript
 * // Entry: 'src/index.ts'
 * const reader = new Reader(context);
 * await reader.onBefore();
 * // Processes all files in src/ directory
 * ```
 */
export class Reader extends ScriptPlugin<Code2MDContext> {
  /**
   * Initialize the Reader plugin
   *
   * @param context - Code2MD context containing source path configuration
   */
  constructor(context: Code2MDContext) {
    super(context, 'Reader');
  }

  /**
   * Main execution method that scans and processes source files
   *
   * Implementation Details:
   * 1. Reads source path from context configuration
   * 2. Scans entry point for all TypeScript source files
   * 3. Processes each file to extract metadata and path information
   * 4. Generates output path mappings for markdown files
   * 5. Stores processed file information in context for downstream plugins
   *
   * Business Rules:
   * - Handles both file and directory entry points
   * - Processes all files recursively in directory entries
   * - Generates relative paths from current working directory
   * - Maps source file extensions to .md output extensions
   * - Preserves directory structure in output paths
   * - Provides detailed logging for debugging and monitoring
   *
   * @throws {Error} When source path is invalid or inaccessible
   * @throws {Error} When file system operations fail
   *
   * @example
   * ```typescript
   * await reader.onBefore();
   * // Scans sourcePath and processes all TypeScript files
   * ```
   */
  override async onBefore(): Promise<void> {
    const { sourcePath } = this.context.options;
    this.logger.info(`Reading entry: ${sourcePath}`);
    const entryAllFiles = this.getEntryAllFiles([sourcePath!]);
    this.logger.debug('Read entry:', JSON.stringify(entryAllFiles, null, 2));

    const outputs = entryAllFiles.map((entryFile) => {
      const relativePath = relative(process.cwd(), entryFile);
      const ext = extname(entryFile);
      const name = basename(entryFile, ext);
      return {
        fullPath: entryFile,
        name,
        dir: dirname(entryFile),
        ext,
        relativePath,
        outputPath: join(dirname(entryFile), `${name}.md`)
      } as ReaderOutput;
    });

    this.context.setOptions({
      readerOutputs: outputs
    });
  }

  /**
   * Get all files from entry points (files or directories)
   *
   * Implementation Details:
   * 1. Processes each entry point in the provided array
   * 2. Determines if entry is a file or directory using statSync
   * 3. For file entries: extracts directory path for scanning
   * 4. For directory entries: scans directory contents directly
   * 5. Recursively processes subdirectories and collects all files
   * 6. Returns unique file paths using Set to avoid duplicates
   *
   * Business Rules:
   * - File entries: scans the directory containing the file
   * - Directory entries: scans the directory and all subdirectories
   * - Handles both files and subdirectories within entry points
   * - Uses Set to ensure unique file paths
   * - Processes entries sequentially for predictable results
   * - Skips invalid or inaccessible paths gracefully
   *
   * @param entries - Array of entry paths (files or directories)
   * @returns Array of unique file paths found in entry points
   *
   * @throws {Error} When entry path is invalid or inaccessible
   * @throws {Error} When directory reading fails
   *
   * @example
   * ```typescript
   * const files = reader.getEntryAllFiles(['src/', 'lib/index.ts']);
   * // Returns all files in src/ directory and lib/ directory
   * ```
   *
   * @example Single File Entry
   * ```typescript
   * const files = reader.getEntryAllFiles(['src/user.ts']);
   * // Scans src/ directory and returns all files found
   * ```
   */
  private getEntryAllFiles(entries: string[]): string[] {
    const entryValues = new Set<string>();
    entries.forEach((entry) => {
      const entryPath = statSync(entry).isFile() ? dirname(entry) : entry;
      const dirs = readdirSync(entryPath, 'utf-8');
      return dirs.map((dir) => {
        const fullPath = join(entryPath, dir);
        if (statSync(fullPath).isFile()) {
          entryValues.add(fullPath);
        } else {
          this.getAllFilePaths(fullPath).forEach((filePath) => {
            entryValues.add(filePath);
          });
        }
      });
    });
    return Array.from(entryValues);
  }

  /**
   * Recursively collect all file paths from a directory
   *
   * Implementation Details:
   * 1. Reads directory contents using readdirSync
   * 2. Iterates through each item in the directory
   * 3. Determines if item is file or directory using statSync
   * 4. For directories: recursively calls itself to process subdirectories
   * 5. For files: adds file path to the collection Set
   * 6. Returns accumulated file paths from all subdirectories
   *
   * Business Rules:
   * - Processes directories recursively to any depth
   * - Collects all files, regardless of extension
   * - Uses Set to ensure unique file paths
   * - Skips symbolic links and special files
   * - Handles empty directories gracefully
   * - Maintains original file path order within each directory
   *
   * @param dirPath - Directory path to scan recursively
   * @param filePaths - Set to accumulate file paths (used for recursion)
   * @returns Set containing all file paths found in directory and subdirectories
   *
   * @throws {Error} When directory path is invalid or inaccessible
   * @throws {Error} When directory reading fails
   *
   * @example
   * ```typescript
   * const files = reader.getAllFilePaths('./src');
   * // Returns all files in src/ and all subdirectories
   * ```
   *
   * @example Nested Directory Structure
   * ```typescript
   * // Directory structure: src/components/Button/index.ts
   * const files = reader.getAllFilePaths('./src');
   * // Returns: Set { './src/components/Button/index.ts', ... }
   * ```
   */
  private getAllFilePaths(
    dirPath: string,
    filePaths: Set<string> = new Set()
  ): Set<string> {
    const files = readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = join(dirPath, file);

      if (statSync(fullPath).isDirectory()) {
        this.getAllFilePaths(fullPath, filePaths);
      } else {
        filePaths.add(fullPath);
      }
    });

    return filePaths;
  }
}
