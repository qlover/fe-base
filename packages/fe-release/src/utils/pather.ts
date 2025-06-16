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
  toLocalPath(sourcePath: string): string {
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
  isSubPath(sourcePath: string, targetPath: string): boolean {
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
   * Normalised `startsWith` helper.
   */
  startsWith(sourcePath: string, targetPath: string): boolean {
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
   * Segment-aware containment check (not mere substring).
   */
  containsPath(sourcePath: string, targetPath: string): boolean {
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
