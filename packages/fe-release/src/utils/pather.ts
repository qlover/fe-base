import { sep, normalize } from 'node:path';

/**
 * Cross-platform path utility
 *
 * Significance: Provides reliable path normalization and comparison across Windows & POSIX.
 * Core idea: Always operate on a fully normalized local-style path before any comparison.
 * Main function: Convert mixed style paths to the host format and expose helpers such as
 *                `startsWith`, `containsPath`, and `isSubPath`.
 * Main purpose: Make path handling predictable in toolchains that manipulate both Windows
 *               and POSIX paths.
 *
 * @example
 * ```ts
 * const pather = new Pather();
 * pather.isSubPath('src\\utils', 'src'); // true on every platform
 * ```
 */
export class Pather {
  /**
   * Convert any style path (Windows / POSIX / mixed) to the current platform format.
   *
   * - Replaces every `/`, `\\`, `//`, etc. with the local `path.sep`.
   * - Collapses duplicate separators.
   * - Resolves `.` and `..` via `path.normalize`.
   *
   * @param sourcePath - string - Path to normalize.
   * @returns string The normalized local path.
   *
   * @example
   * ```ts
   * const pather = new Pather();
   * pather.toLocalPath('src\\a//b');
   * // => 'src/a/b' on POSIX, 'src\\a\\b' on Windows
   * ```
   */
  public toLocalPath(sourcePath: string): string {
    // 1. Collapse any kind of repeated separator to the current platform separator.
    const collapsed = sourcePath.replace(/[\\/]+/g, sep);
    // 2. Use `path.normalize` to get rid of '.', '..', etc.
    const normalized = normalize(collapsed);
    // 3. Ensure resulting separators are consistent in rare edge-cases.
    return normalized.replace(/[\\/]+/g, sep);
  }

  /**
   * Check if `sourcePath` is inside (or equal to) `targetPath`.
   * The comparison is segment-aware so `src/ab` is **not** considered inside `src/a`.
   *
   * @param sourcePath - string - Candidate child path.
   * @param targetPath - string - Candidate parent path.
   * @returns boolean Whether `sourcePath` is within `targetPath`.
   */
  public isSubPath(sourcePath: string, targetPath: string): boolean {
    let child = this.toLocalPath(sourcePath);
    let parent = this.toLocalPath(targetPath);

    // Strip trailing separators for clean comparison
    while (child.endsWith(sep)) {
      child = child.slice(0, -1);
    }
    while (parent.endsWith(sep)) {
      parent = parent.slice(0, -1);
    }

    if (child === parent) return true;

    const boundaryIndex = parent.length;
    if (!child.startsWith(parent)) return false;

    // Ensure next char is a separator to respect segment boundary
    return child[boundaryIndex] === sep;
  }

  /**
   * Normalized path prefix check
   *
   * Checks if sourcePath starts with targetPath after normalization.
   * Handles cross-platform path separators and trailing separators.
   *
   * @param sourcePath - Path to check
   * @param targetPath - Prefix path to match
   * @returns True if sourcePath starts with targetPath
   *
   * @example Basic usage
   * ```typescript
   * const pather = new Pather();
   *
   * pather.startsWith('src/utils/file.ts', 'src')     // true
   * pather.startsWith('src\\utils\\file.ts', 'src')   // true
   * pather.startsWith('lib/utils/file.ts', 'src')     // false
   * ```
   *
   * @example Trailing separators
   * ```typescript
   * pather.startsWith('src/utils', 'src/')    // true
   * pather.startsWith('src/utils/', 'src')    // true
   * pather.startsWith('src2/utils', 'src')    // false
   * ```
   */
  public startsWith(sourcePath: string, targetPath: string): boolean {
    let src = this.toLocalPath(sourcePath);
    let tgt = this.toLocalPath(targetPath);

    // Strip trailing separators for consistent comparison
    while (src.endsWith(sep)) {
      src = src.slice(0, -1);
    }
    while (tgt.endsWith(sep)) {
      tgt = tgt.slice(0, -1);
    }

    return src.startsWith(tgt);
  }

  /**
   * Segment-aware path containment check
   *
   * Checks if sourcePath contains targetPath as a complete path segment.
   * Unlike simple substring matching, this ensures proper path boundaries.
   * For example, 'src/abc' does not contain 'src/a' even though 'src/a'
   * is a substring.
   *
   * Features:
   * - Cross-platform path handling
   * - Proper segment boundary checking
   * - Trailing separator normalization
   * - Exact match support
   *
   * @param sourcePath - Path to search in
   * @param targetPath - Path to search for
   * @returns True if sourcePath contains targetPath as a segment
   *
   * @example Basic usage
   * ```typescript
   * const pather = new Pather();
   *
   * pather.containsPath('src/utils/file.ts', 'utils')     // true
   * pather.containsPath('src/utils/file.ts', 'src/utils') // true
   * pather.containsPath('src/utils/file.ts', 'til')      // false
   * ```
   *
   * @example Segment boundaries
   * ```typescript
   * pather.containsPath('src/abc/file.ts', 'src/a')     // false
   * pather.containsPath('src/abc/file.ts', 'src/abc')   // true
   * ```
   *
   * @example Trailing separators
   * ```typescript
   * pather.containsPath('src/utils/', 'utils')     // true
   * pather.containsPath('src/utils', 'utils/')     // true
   * pather.containsPath('src/utils/', 'utils/')    // true
   * ```
   */
  public containsPath(sourcePath: string, targetPath: string): boolean {
    let src = this.toLocalPath(sourcePath);
    let tgt = this.toLocalPath(targetPath);

    // Strip trailing separators for consistent comparison
    while (src.endsWith(sep)) {
      src = src.slice(0, -1);
    }
    while (tgt.endsWith(sep)) {
      tgt = tgt.slice(0, -1);
    }

    if (src === tgt) return true;

    const idx = src.indexOf(tgt);
    if (idx === -1) return false;

    const before = idx === 0 ? '' : src[idx - 1];
    const afterIdx = idx + tgt.length;
    const after = afterIdx >= src.length ? '' : src[afterIdx];

    const beforeOk = before === '' || before === sep;
    const afterOk = after === '' || after === sep;

    return beforeOk && afterOk;
  }
}
