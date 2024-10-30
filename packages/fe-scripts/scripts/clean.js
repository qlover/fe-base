import { existsSync, readFileSync, readdirSync, lstatSync } from 'fs';
import { join, relative } from 'path';
import ignore from 'ignore';
import { sync as rimraf } from 'rimraf';

/**
 * clean files
 * @param {import('@qlover/fe-scripts/scripts').CleanOptions} options
 */
export async function clean(options) {
  let { filesToClean = [], logger, gitignore, recursion, dryrun } = options;
  let ignoreToClean = [];

  // if config.cleanFiles is empty, try to read .gitignore
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
      logger.warn('read .gitignore file failed:', error.message);
    }

    // merge filesToClean and ignoreToClean, and remove duplicate items
    filesToClean = Array.from(new Set([...filesToClean, ...ignoreToClean]));
  }

  if (filesToClean.length === 0) {
    logger.log('none files to clean');
    return;
  }

  const ig = ignore().add(filesToClean);

  if (dryrun) {
    logger.info('preview mode - the following files will be deleted:');
  }

  const deleteFiles = (dir) => {
    if (existsSync(dir)) {
      const files = readdirSync(dir);
      files.forEach((file) => {
        const fullPath = join(dir, file);
        const relativePath = relative(process.cwd(), fullPath);
        const isDirectory = lstatSync(fullPath).isDirectory();

        if (ig.ignores(relativePath)) {
          if (dryrun) {
            logger.info(
              `will delete ${isDirectory ? 'directory' : 'file'}: ${fullPath}`
            );
          } else {
            try {
              rimraf(fullPath);
              logger.info(
                `deleted ${isDirectory ? 'directory' : 'file'}: ${fullPath}`
              );
            } catch (error) {
              logger.error(`failed to delete ${fullPath}: ${error.message}`);
            }
          }
        } else if (isDirectory && recursion) {
          // if it is a directory and recursion is enabled, process it recursively
          deleteFiles(fullPath);
        }
      });
    }
  };

  deleteFiles(process.cwd());
}
