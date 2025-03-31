import Plugin from '../Plugin';
import ReleaseContext from '../interface/ReleaseContext';
import { ExecutorReleaseContext, ReleaseItInstanceType } from '../type';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface CheckEnvironmentCiOptions {
  rootPath: string;

  /**
   * Release target package, default is all packages
   *
   * You can set `packages` to override the default behavior
   */
  publishPath?: string;

  /**
   * publish path package.json
   */
  packageJson?: Record<string, unknown>;
}

const MANIFEST_PATH = 'package.json';
export default class CheckEnvironment extends Plugin {
  readonly pluginName = 'check-environment';

  constructor(context: ReleaseContext, releaseIt?: ReleaseItInstanceType) {
    super(context);

    if (!releaseIt) {
      throw new Error('releaseIt is not required');
    }

    this.switchToRootPath();

    this.hasReleaseIt();

    this.hasReleaseTargetPackage();
  }

  switchToRootPath(): void {
    const rootPath = this.context.options.rootPath;
    process.chdir(rootPath);
    this.logger.debug('Current working directory: ', rootPath);
  }

  hasReleaseIt(): boolean {
    if (this.getEnv('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    return true;
  }

  async onBefore(_context: ExecutorReleaseContext): Promise<void> {
    this.logger.verbose('CheckEnvironment onBefore');
    this.hasReleaseTargetPackage();
  }

  getManifest(publishPath: string): Record<string, unknown> {
    const packageJsonPath = join(publishPath, MANIFEST_PATH);
    return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  }

  hasReleaseTargetPackage(): boolean {
    const publishPath = this.getConfig('publishPath', './') as string;
    const packageJson =
      this.getConfig('packageJson') || this.getManifest(publishPath);

    if (!packageJson) {
      throw new Error(`${MANIFEST_PATH} is not found in ${publishPath}`);
    }

    this.setConfig({
      publishPath: resolve(publishPath),
      packageJson: packageJson
    });

    return true;
  }
}
