import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import ignore from 'ignore';
import { FeScriptContext } from '../lib/index.js';

async function compatRimraf(targetPath, options = {}) {
  const rimraf = await import('rimraf');
  return rimraf.rimraf(targetPath, options);
}

/**
 * Recursively get all ignored files and directories under the specified directory
 * @param {string} dir current directory
 * @param {string} rootDir root directory
 * @param {import('ignore').Ignore} ig ignore instance
 * @param {boolean} recursion whether to recursion
 * @returns {string[]} ignored files and directories list
 */
function getIgnoredFiles(dir, rootDir, ig, recursion) {
  const ignoredFiles = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    // Get the path relative to the root directory
    const relativePath = relative(rootDir, fullPath);

    // Check if the current file/directory is ignored
    if (ig.ignores(relativePath)) {
      ignoredFiles.push(relativePath);
      continue; // If the current directory is ignored, do not continue to traverse its subdirectories
    }

    // If it is a directory, recursively process
    if (item.isDirectory() && recursion) {
      ignoredFiles.push(...getIgnoredFiles(fullPath, rootDir, ig, recursion));
    }
  }

  return ignoredFiles;
}

/**
 * Clean files
 * @param {FeScriptContext<import('@qlover/fe-scripts/scripts').CleanOptions>} options
 */
export async function clean(options) {
  const context = new FeScriptContext(options);
  const { logger, feConfig, dryRun } = context;
  let { files, gitignore, recursion } = context.options;

  files = files?.length ? files : feConfig.cleanFiles;

  // Ensure files is an array
  if (typeof files === 'string') {
    files = [files];
  }

  let filesToClean = files;
  let ignoreToClean = [];

  // If gitignore is enabled, try to read the .gitignore file
  if (gitignore) {
    try {
      const gitignorePath = join(process.cwd(), '.gitignore');
      if (existsSync(gitignorePath)) {
        const gitignoreContent = readFileSync(gitignorePath, 'utf8');
        ignoreToClean = gitignoreContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'));
      }
    } catch (error) {
      logger.warn('Failed to read .gitignore file:', error.message);
    }
  }

  // Merge all ignore rules
  const allRules = [...filesToClean, ...ignoreToClean];

  if (allRules.length === 0) {
    logger.log('no files to clean');
    return;
  }

  const cwd = process.cwd();

  // Create ignore instance and add rules
  const ig = ignore().add(allRules);

  // Get all ignored files and directories
  const filesToDelete = getIgnoredFiles(cwd, cwd, ig, recursion);

  if (filesToDelete.length === 0) {
    logger.log('no files matched to clean');
    return;
  }

  // Iterate to delete files
  for (const file of filesToDelete) {
    const targetPath = join(cwd, file);

    if (dryRun) {
      logger.info(`Will delete: ${file}`);
      continue;
    }

    try {
      logger.info(`Deleted: ${file}`);
      await compatRimraf(targetPath);
    } catch (error) {
      logger.error(`Failed to delete ${file}:`, error.message);
    }
  }

  if (!dryRun) {
    logger.info('Clean completed');
  }
}
