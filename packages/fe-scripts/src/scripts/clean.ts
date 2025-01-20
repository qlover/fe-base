import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import ignore, { Ignore } from 'ignore';
import {
  FeScriptContext,
  FeScriptContextOptions
} from '@qlover/scripts-context';

export interface CleanOptions {
  /**
   * Files to be cleaned
   * @default `fe-config.cleanFiles`
   */
  files?: string[];
  /**
   * Whether to recursively clean files
   * @default `false`
   */
  recursion?: boolean;
  /**
   * Whether to use .gitignore file to determine files to be deleted
   * @default `false`
   */
  gitignore?: boolean;
}

async function compatRimraf(
  targetPath: string,
  options = {}
): Promise<boolean> {
  const rimraf = await import('rimraf');
  return rimraf.rimraf(targetPath, options);
}

function getIgnoredFiles(
  dir: string,
  rootDir: string,
  ig: Ignore,
  recursion: boolean
): string[] {
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

export async function clean(
  options: FeScriptContextOptions<CleanOptions>
): Promise<void> {
  const context = new FeScriptContext(options);
  const { logger, feConfig, dryRun } = context;
  const { gitignore, recursion = false } = context.options;
  let files = context.options.files || [];

  files = files?.length ? files : feConfig.cleanFiles || [];

  // Ensure files is an array
  if (typeof files === 'string') {
    files = [files];
  }

  const filesToClean = files;
  let ignoreToClean: string[] = [];

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
      logger.warn('Failed to read .gitignore file:', (error as Error).message);
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
      logger.error(`Failed to delete ${file}:`, (error as Error).message);
    }
  }

  if (!dryRun) {
    logger.info('Clean completed');
  }
}
