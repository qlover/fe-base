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
import { GeneratorResult } from './type';
import { promises as fsPromises } from 'fs';
const { copyFile, stat } = fsPromises;

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
  async copyFilesPromise(
    sourcePath: string,
    targetDir: string,
    ig?: ignore.Ignore
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
          await this.copyFilesPromise(sourceFilePath, targetFilePath, ig);
        } else {
          // console.log(`copy ${sourceFilePath} to ${targetFilePath}`);
          await copyFile(sourceFilePath, targetFilePath);
        }
      })
    );
  }

  /**
   * copy templates recursively
   * @param {string} sourePath - source directory
   * @param {string} targetDir - target directory
   * @param {ignore.Ignore} ig - ignore rules
   */
  copyFilesSync(
    sourePath: string,
    targetDir: string,
    ig?: ignore.Ignore
  ): void {
    const items = readdirSync(sourePath);

    for (const item of items) {
      const sourcePath = join(sourePath, item);
      const targetPath = join(targetDir, item);

      if (ig && ig.ignores(item)) {
        continue; // ignore files listed in .gitignore
      }

      // check if target directory exists, if not create it
      this.ensureDir(dirname(targetPath));

      if (statSync(sourcePath).isDirectory()) {
        this.copyFilesSync(sourcePath, targetPath, ig);
      } else {
        // console.log(`copy ${sourcePath} to ${targetPath}`);
        copyFileSync(sourcePath, targetPath);
      }
    }
  }

  create(result: GeneratorResult): void {
    const {
      targetPath,
      templateRootPath,
      subPackages,
      packagesNames = 'packages'
    } = result;

    if (!targetPath || !templateRootPath) {
      throw new Error('targetPath and templatePath are required');
    }

    this.createPath(result);

    // if pack template, copy sub packages
    if (subPackages) {
      // if pack template, copy sub packages
      for (const subPackage of subPackages) {
        const packagesPath = join(targetPath, packagesNames, subPackage);
        this.createPath({
          ...result,
          targetPath: packagesPath,
          template: subPackage
        });
      }
    }
  }

  async createPromise(result: GeneratorResult): Promise<void> {
    const {
      targetPath,
      templateRootPath,
      subPackages,
      packagesNames = 'packages'
    } = result;

    if (!targetPath || !templateRootPath) {
      throw new Error('targetPath and templatePath are required');
    }

    await this.createPathPromise(result);

    // if pack template, copy sub packages
    if (subPackages) {
      // if pack template, copy sub packages
      for (const subPackage of subPackages) {
        const packagesPath = join(targetPath, packagesNames, subPackage);
        await this.createPathPromise({
          ...result,
          targetPath: packagesPath,
          template: subPackage
        });
      }
    }
  }

  createPath(result: GeneratorResult): void {
    const { targetPath = '', templateRootPath, template } = result;

    this.ensureDir(targetPath);
    // if not pack template, copy templates
    const templatePath = join(templateRootPath, template);
    const ig = this.getIg(targetPath);

    this.copyFilesSync(templatePath, targetPath, ig);
  }

  createPathPromise(result: GeneratorResult): Promise<void> {
    const { targetPath = '', templateRootPath, template } = result;

    this.ensureDir(targetPath);
    // if not pack template, copy templates
    const templatePath = join(templateRootPath, template);
    const ig = this.getIg(targetPath);

    return this.copyFilesPromise(templatePath, targetPath, ig);
  }
}
