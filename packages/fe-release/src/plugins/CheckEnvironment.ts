import type { DeepPartial, UserInfoType } from '../type';
import type ReleaseContext from '../interface/ReleaseContext';
import type { FeReleaseConfig } from '@qlover/scripts-context';
import Plugin from '../Plugin';
import { DEFAULT_SOURCE_BRANCH, MANIFEST_PATH } from '../defaults';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PluginClass, PluginTuple } from '../utils/tuple';

type PackageJson = Record<string, unknown>;
export interface EnvironmentProps extends FeReleaseConfig {
  /**
   * The source branch of the project
   *
   * @default `master`
   */
  sourceBranch?: string;

  /**
   * The environment of the project
   *
   * @default `development`
   */
  releaseEnv?: string;

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
   * Whether to skip checking the package.json file
   *
   * @default `false`
   */
  skipCheckPackage?: boolean;

  /**
   * Whether to publish a PR
   *
   * @default `false`
   */
  releasePR?: boolean;

  repoInfo?: UserInfoType;

  plugins?: PluginTuple<PluginClass>[];
}

export default class CheckEnvironment extends Plugin<EnvironmentProps> {
  constructor(context: ReleaseContext) {
    super(context, 'environment', context.feConfig.release);

    if (this.getEnv('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    const publishPath = this.getPublishPath();
    const packageJson = this.getPublishPackage();

    if (!packageJson) {
      throw new Error(`${MANIFEST_PATH} is not found in ${publishPath}`);
    }

    const rootPath = resolve(this.options.rootPath || process.cwd());

    this.setConfig({
      publishPath: publishPath,
      packageJson: packageJson as DeepPartial<PackageJson>,
      rootPath,
      sourceBranch:
        this.options.sourceBranch ||
        this.getEnv('FE_RELEASE_BRANCH') ||
        this.getEnv('FE_RELEASE_SOURCE_BRANCH', DEFAULT_SOURCE_BRANCH),
      releaseEnv:
        this.options.releaseEnv || this.getEnv('NODE_ENV', 'development')
    });

    this.logger.debug('Current working directory: ', rootPath);
  }

  getPublishPath(): string {
    return this.props.publishPath || './';
  }

  /**
   * Check if the package.json has been modified
   *
   * @override
   */
  async onBefore(): Promise<void> {
    this.logger.verbose('[before] CheckEnvironment');

    // Whether or not to modify the package.json
    if (
      !this.getConfig('skipCheckPackage') &&
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
