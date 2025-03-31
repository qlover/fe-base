import Plugin from '../Plugin';
import { DEFAULT_SOURCE_BRANCH, MANIFEST_PATH } from '../defaults';
import ReleaseContext from '../interface/ReleaseContext';
import type { DeepPartial, ReleaseItInstanceType } from '../type';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

type PackageJson = Record<string, unknown>;
export interface CheckEnvironmentCiOptions {
  /**
   * The source branch of the project
   *
   * @default `master`
   */
  sourceBranch?: string;

  /**
   * The root path of the project
   *
   * @default `process.cwd()`
   */
  rootPath?: string;

  /**
   * publish path package.json
   */
  packageJson?: PackageJson;

  /**
   * The increment of the version
   *
   * @default `patch`
   */
  increment?: string;
}

export default class CheckEnvironment extends Plugin {
  readonly pluginName = 'check-environment';

  constructor(context: ReleaseContext, releaseIt?: ReleaseItInstanceType) {
    super(context);

    if (!releaseIt) {
      throw new Error('releaseIt is required');
    }

    if (!context.options.rootPath) {
      throw new Error('rootPath is not set');
    }

    if (this.getEnv('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    const publishPath = this.getPublishPath();
    const packageJson = this.getPublishPackage();

    if (!packageJson) {
      throw new Error(`${MANIFEST_PATH} is not found in ${publishPath}`);
    }

    this.setConfig({
      publishPath: resolve(publishPath),

      sourceBranch: this.getSourceBranch(),
      packageJson: packageJson as DeepPartial<PackageJson>,
      rootPath: resolve(context.options.rootPath)
    });

    this.logger.debug('Current working directory: ', context.options.rootPath);
  }

  getSourceBranch(): string {
    return (
      this.context.options.sourceBranch ||
      this.context.getEnv().get('FE_RELEASE_BRANCH') ||
      this.context.getEnv().get('FE_RELEASE_SOURCE_BRANCH') ||
      DEFAULT_SOURCE_BRANCH
    );
  }

  getPublishPath(): string {
    return this.getConfig('publishPath', './') as string;
  }

  /**
   * Check if the package.json has been modified
   *
   * @override
   */
  async onBefore(): Promise<void> {
    this.logger.verbose('CheckEnvironment onBefore');

    // Whether or not to modify the package.json
    if (
      !this.context.options.skipCheckPackage &&
      !(await this.checkModifyPublishPackage())
    ) {
      throw new Error('No changes to publish packages');
    }
  }

  getPublishPackage(): PackageJson | undefined {
    const packageJson = this.getConfig('packageJson') as PackageJson;

    if (packageJson) {
      return packageJson;
    }

    const publishPath = this.getPublishPath();
    const packageJsonPath = join(publishPath, MANIFEST_PATH);
    return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  }

  async checkModifyPublishPackage(): Promise<boolean> {
    const sourceBranch = this.getConfig('sourceBranch') as string;
    const result = await this.shell.exec(
      `git diff --name-only origin/${sourceBranch}...HEAD`,
      { dryRun: false }
    );

    const changed = result.split('\n');

    if (changed.length === 0) {
      return false;
    }

    const publishPath = this.getPublishPath();

    if (this.getConfig('rootPath') === resolve(publishPath)) {
      this.logger.debug('Release in root path');
      return true;
    }

    for (const filepath of changed) {
      if (
        filepath.includes(publishPath) ||
        // If the filepath is a relative path, it will be resolved to the root path
        resolve(filepath).includes(publishPath)
      ) {
        return true;
      }
    }

    return false;
  }
}
