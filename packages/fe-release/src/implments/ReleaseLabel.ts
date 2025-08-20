/**
 * @module ReleaseLabel
 * @description Release label management and file change detection
 *
 * This module provides utilities for managing release labels and detecting
 * which packages have changed based on file paths. It supports custom
 * comparison logic and label formatting.
 *
 * Core Features:
 * - File change detection
 * - Package path matching
 * - Label generation
 * - Custom comparison logic
 *
 * @example Basic usage
 * ```typescript
 * const label = new ReleaseLabel({
 *   changePackagesLabel: 'changed:${name}',
 *   packagesDirectories: ['packages/a', 'packages/b']
 * });
 *
 * // Find changed packages
 * const changed = label.pick(['packages/a/src/index.ts']);
 * // ['packages/a']
 *
 * // Generate labels
 * const labels = label.toChangeLabels(changed);
 * // ['changed:packages/a']
 * ```
 *
 * @example Custom comparison
 * ```typescript
 * const label = new ReleaseLabel({
 *   changePackagesLabel: 'changed:${name}',
 *   packagesDirectories: ['packages/a'],
 *   compare: (file, pkg) => file.includes(pkg)
 * });
 *
 * const changed = label.pick(['src/packages/a/index.ts']);
 * // ['packages/a']
 * ```
 */

/**
 * Function type for custom file path comparison
 *
 * Used to determine if a changed file belongs to a package.
 * Default implementation checks if the file path starts with
 * the package path.
 *
 * @param changedFilePath - Path of the changed file
 * @param packagePath - Path of the package to check against
 * @returns True if the file belongs to the package
 */
export type ReleaseLabelCompare = (
  changedFilePath: string,
  packagePath: string
) => boolean;

export interface ReleaseLabelOptions {
  /**
   * The change packages label
   */
  changePackagesLabel: string;

  /**
   * The packages directories
   */
  packagesDirectories: string[];

  compare?: ReleaseLabelCompare;
}

/**
 * Core class for managing release labels and change detection
 *
 * Provides utilities for detecting changed packages and generating
 * appropriate labels. Supports custom comparison logic and label
 * formatting.
 *
 * Features:
 * - File change detection
 * - Package path matching
 * - Label generation
 * - Custom comparison logic
 *
 * @example Basic usage
 * ```typescript
 * const label = new ReleaseLabel({
 *   changePackagesLabel: 'changed:${name}',
 *   packagesDirectories: ['packages/a', 'packages/b']
 * });
 *
 * // Find changed packages
 * const changed = label.pick(['packages/a/src/index.ts']);
 *
 * // Generate labels
 * const labels = label.toChangeLabels(changed);
 * ```
 *
 * @example Custom comparison
 * ```typescript
 * const label = new ReleaseLabel({
 *   changePackagesLabel: 'changed:${name}',
 *   packagesDirectories: ['packages/a'],
 *   compare: (file, pkg) => file.includes(pkg)
 * });
 *
 * const changed = label.pick(['src/packages/a/index.ts']);
 * ```
 */
export class ReleaseLabel {
  /**
   * Creates a new ReleaseLabel instance
   *
   * @param options - Configuration options for label management
   *
   * @example
   * ```typescript
   * const label = new ReleaseLabel({
   *   // Label template with ${name} placeholder
   *   changePackagesLabel: 'changed:${name}',
   *
   *   // Package directories to monitor
   *   packagesDirectories: ['packages/a', 'packages/b'],
   *
   *   // Optional custom comparison logic
   *   compare: (file, pkg) => file.includes(pkg)
   * });
   * ```
   */
  constructor(private readonly options: ReleaseLabelOptions) {}

  /**
   * Compares a changed file path against a package path
   *
   * Uses custom comparison function if provided, otherwise
   * checks if the file path starts with the package path.
   *
   * @param changedFilePath - Path of the changed file
   * @param packagePath - Path of the package to check against
   * @returns True if the file belongs to the package
   *
   * @example
   * ```typescript
   * // Default comparison
   * label.compare('packages/a/src/index.ts', 'packages/a');
   * // true
   *
   * // Custom comparison
   * const label = new ReleaseLabel({
   *   ...options,
   *   compare: (file, pkg) => file.includes(pkg)
   * });
   * label.compare('src/packages/a/index.ts', 'packages/a');
   * // true
   * ```
   */
  compare(changedFilePath: string, packagePath: string): boolean {
    if (typeof this.options.compare === 'function') {
      return this.options.compare(changedFilePath, packagePath);
    }

    return changedFilePath.startsWith(packagePath);
  }

  /**
   * Generates a change label for a single package
   *
   * Replaces ${name} placeholder in the label template with
   * the package path.
   *
   * @param packagePath - Path of the package
   * @param label - Optional custom label template
   * @returns Formatted change label
   *
   * @example
   * ```typescript
   * // Default label template
   * label.toChangeLabel('packages/a');
   * // 'changed:packages/a'
   *
   * // Custom label template
   * label.toChangeLabel('packages/a', 'modified:${name}');
   * // 'modified:packages/a'
   * ```
   */
  toChangeLabel(
    packagePath: string,
    label: string = this.options.changePackagesLabel
  ): string {
    return label.replace('${name}', packagePath);
  }

  /**
   * Generates change labels for multiple packages
   *
   * Maps each package path to a formatted change label.
   *
   * @param packages - Array of package paths
   * @param label - Optional custom label template
   * @returns Array of formatted change labels
   *
   * @example
   * ```typescript
   * // Default label template
   * label.toChangeLabels(['packages/a', 'packages/b']);
   * // ['changed:packages/a', 'changed:packages/b']
   *
   * // Custom label template
   * label.toChangeLabels(
   *   ['packages/a', 'packages/b'],
   *   'modified:${name}'
   * );
   * // ['modified:packages/a', 'modified:packages/b']
   * ```
   */
  toChangeLabels(
    packages: string[],
    label: string = this.options.changePackagesLabel
  ): string[] {
    return packages.map((pkg) => this.toChangeLabel(pkg, label));
  }

  /**
   * Identifies packages affected by changed files
   *
   * Checks each changed file against package paths to determine
   * which packages have been modified.
   *
   * @param changedFiles - Array or Set of changed file paths
   * @param packages - Optional array of package paths to check
   * @returns Array of affected package paths
   *
   * @example
   * ```typescript
   * // Check against default packages
   * label.pick(['packages/a/src/index.ts']);
   * // ['packages/a']
   *
   * // Check specific packages
   * label.pick(
   *   ['packages/a/index.ts', 'packages/b/test.ts'],
   *   ['packages/a', 'packages/c']
   * );
   * // ['packages/a']
   *
   * // Using Set of files
   * label.pick(new Set(['packages/a/index.ts']));
   * // ['packages/a']
   * ```
   */
  pick(
    changedFiles: Array<string> | Set<string>,
    packages: string[] = this.options.packagesDirectories
  ): string[] {
    const result: string[] = [];

    for (const pkgPath of packages) {
      for (const filepath of changedFiles) {
        if (this.compare(filepath, pkgPath)) {
          result.push(pkgPath);
          break;
        }
      }
    }

    return result;
  }
}
