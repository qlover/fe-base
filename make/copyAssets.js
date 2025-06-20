import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, relative, basename, dirname } from 'node:path';
import { glob } from 'glob';

/**
 * Copy files or directories (support glob pattern)
 *
 * Significance: Asset management utility for build processes
 * Core idea: Flexible file/directory copying with glob pattern support
 * Main function: Copy matched files/directories to target location
 * Main purpose: Simplify asset copying in build scripts
 *
 * @example
 * // Copy all files in hbs directory to dist
 * await copyAssets('./hbs', 'dist');
 * // Copy all .hbs files to dist
 * await copyAssets('./hbs/*.hbs', 'dist');
 * // Copy all .hbs files to dist/hbs
 * await copyAssets('./hbs/*.hbs', 'dist/hbs');
 *
 * @param {string} sourcePattern - source path (support glob, like `./src/**`)
 * @param {string} targetDir - target directory
 * @param {object} [options] - options
 * @param {boolean} [options.verbose=false] - whether to show verbose logs
 * @param {string[]} [options.ignores=[]] - ignore patterns
 */
export async function copyAssets(sourcePattern, targetDir, options = {}) {
  const { verbose = false, ignores = [] } = options;

  try {
    // 1. Get all matching files/directories
    const matches = await glob(sourcePattern, { nodir: false });

    if (matches.length === 0) {
      console.warn(`No matching items found: ${sourcePattern}`);
      return;
    }

    // 2. Iterate over all matching items
    for (const sourcePath of matches) {
      const stats = await stat(sourcePath);
      const relativePath = relative(process.cwd(), sourcePath);

      if (stats.isFile()) {
        // File: Copy directly to target directory
        const targetPath = join(targetDir, basename(sourcePath));
        await mkdir(dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
        if (verbose)
          console.log(
            `Copy file: ${relativePath} → ${relative(process.cwd(), targetPath)}`
          );
      } else if (stats.isDirectory()) {
        // Directory: Copy all contents directly to target directory
        await copyDirectoryContents(sourcePath, targetDir, verbose, ignores);
      }
    }

    console.log(`✅ Copy completed: ${matches.length} items → ${targetDir}`);
  } catch (error) {
    console.error('Copy failed:', error);
    throw error;
  }
}

/**
 * Copy directory contents directly to target directory (flatten structure)
 *
 * @param {string} srcDir - source directory path
 * @param {string} destDir - destination directory path
 * @param {boolean} verbose - whether to show verbose logs
 * @param {string[]} [ignores=[]] - ignore patterns
 */
async function copyDirectoryContents(srcDir, destDir, verbose, ignores) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (ignores.some((ignore) => srcPath.includes(ignore))) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirectoryContents(srcPath, destPath, verbose, ignores);
    } else {
      await copyFile(srcPath, destPath);
      if (verbose)
        console.log(
          `Copy file: ${relative(process.cwd(), srcPath)} → ${relative(process.cwd(), destPath)}`
        );
    }
  }
}
