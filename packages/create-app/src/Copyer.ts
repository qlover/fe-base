import { dirname, join } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import ignore from 'ignore';
import { promises as fsPromises } from 'fs';
const { copyFile, stat } = fsPromises;

export type CopyCallback = (
  sourceFilePath: string,
  targetFilePath: string
) => boolean | Promise<boolean>;

export class Copyer {
  static IGNORE_FILE = '.gitignore.template';

  constructor(
    private readonly ignoreTargetPath: string,
    private readonly ignoreFile: string = Copyer.IGNORE_FILE
  ) {}

  getIg(targetDir: string = this.ignoreTargetPath): ignore.Ignore | undefined {
    const gitignorePath = join(targetDir, this.ignoreFile);

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

  ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Asynchronously copy files from source to target directory.
   * @param {string} sourcePath - Source directory.
   * @param {string} targetDir - Target directory.
   * @param {ignore.Ignore} ig - Ignore rules.
   * @returns {Promise<void>} - A promise that resolves when the copy is complete.
   * @example
   * await copyer.copyFilesPromise('src', 'dest', ignoreInstance);
   */
  async copyFiles(
    sourcePath: string,
    targetDir: string,
    ig?: ignore.Ignore,
    copyCallback?: CopyCallback
  ): Promise<void> {
    const items = await fsPromises.readdir(sourcePath);

    await Promise.all(
      items.map(async (item) => {
        const sourceFilePath = join(sourcePath, item);
        const targetFilePath = join(targetDir, item);

        if (ig && ig.ignores(item)) {
          return; // ignore files listed in .gitignore
        }

        // Check if target directory exists, if not create it
        this.ensureDir(dirname(targetFilePath));

        const fileStat = await stat(sourceFilePath);

        if (fileStat.isDirectory()) {
          await this.copyFiles(sourceFilePath, targetFilePath, ig);
        } else {
          // console.log(`copy ${sourceFilePath} to ${targetFilePath}`);

          if (
            copyCallback &&
            (await copyCallback(sourceFilePath, targetFilePath))
          ) {
            return;
          }

          await copyFile(sourceFilePath, targetFilePath);
        }
      })
    );
  }

  copyPaths({
    sourcePath,
    targetPath,
    copyCallback
  }: {
    sourcePath: string;
    targetPath: string;
    copyCallback?: CopyCallback;
  }): Promise<void> {
    this.ensureDir(targetPath);
    // if not pack template, copy templates
    const ig = this.getIg();

    return this.copyFiles(sourcePath, targetPath, ig, copyCallback);
  }
}
