import { dirname, join } from 'path';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdirSync
} from 'fs';
import ignore from 'ignore';

export class Copyer {
  static IGNORE_FILE = '.gitignore.template';

  getIg(targetDir: string): ignore.Ignore | undefined {
    const gitignorePath = join(targetDir, Copyer.IGNORE_FILE);

    if (!existsSync(gitignorePath)) {
      return;
    }

    const gitignoreContent = readFileSync(gitignorePath, 'utf8');
    const ignoreToClean = gitignoreContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    const allRules = ignoreToClean;
    // Create ignore instance and add rules
    return ignore().add(allRules);
  }

  /**
   * copy templates recursively
   * @param {string} templatesDir - source directory
   * @param {string} targetDir - target directory
   * @param {ignore.Ignore} ig - ignore rules
   */
  copyTemplates(
    templatesDir: string,
    targetDir: string,
    ig?: ignore.Ignore
  ): void {
    const items = readdirSync(templatesDir);

    for (const item of items) {
      const sourcePath = join(templatesDir, item);
      const targetPath = join(targetDir, item);

      if (ig && ig.ignores(item)) {
        continue; // ignore files listed in .gitignore
      }

      // check if target directory exists, if not create it
      const targetDirPath = dirname(targetPath);
      if (!existsSync(targetDirPath)) {
        mkdirSync(targetDirPath, { recursive: true }); // create directory and its parent directory
      }

      if (statSync(sourcePath).isDirectory()) {
        this.copyTemplates(sourcePath, targetPath, ig);
      } else {
        // console.log(`copy ${sourcePath} to ${targetPath}`);
        copyFileSync(sourcePath, targetPath);
      }
    }
  }
}
