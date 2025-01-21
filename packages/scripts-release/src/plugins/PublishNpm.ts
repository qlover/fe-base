import { ReleaseItInstanceType } from '../type';
import Plugin from '../Plugin';
import { existsSync } from 'fs';
import ReleaseContext from '../ReleaseContext';
import isObject from 'lodash/isObject';
export default class PublishNpm extends Plugin {
  readonly pluginName = 'publish-npm';

  private _releaseItOutput?: Record<string, unknown>;
  private releaseItInstance: ReleaseItInstanceType;

  constructor(context: ReleaseContext, releaseIt?: ReleaseItInstanceType) {
    super(context);

    if (!releaseIt) {
      throw new Error('releaseIt is not required');
    }
    this.releaseItInstance = releaseIt;

    this.getIncrementVersion();
  }

  async onBefore(): Promise<void> {
    // check npm
    await this.checkNpmAuth();

    await this.checkPublishPath();
    // if packageJson is not provided, throw an error
  }

  /**
   * @override
   */
  async onSuccess(): Promise<void> {
    const publishOptions = this.getPublishReleaseItOptions(this.context);

    await this.releaseIt(publishOptions);
  }

  /**
   * Executes the release-it process.
   *
   * @param releaseItOptions - Options for the release-it process.
   * @returns The output from the release-it process.
   */
  async releaseIt(
    releaseItOptions: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.logger.debug('Run release-it method', releaseItOptions);
    const output = await this.releaseItInstance(releaseItOptions);
    this._releaseItOutput = output;
    return output;
  }

  getPublishReleaseItOptions(context: ReleaseContext): Record<string, unknown> {
    return {
      ci: true,
      npm: {
        publish: true
      },
      git: {
        requireCleanWorkingDir: false,
        requireUpstream: false,
        changelog: false
      },
      plugins: {
        '@release-it/conventional-changelog': {
          infile: false
        }
      },
      'dry-run': context.dryRun,
      verbose: true,
      increment: this.getIncrementVersion()
    };
  }

  getIncrementVersion(): string {
    const packageJson = this.getConfig('packageJson');
    if (!isObject(packageJson)) {
      throw new Error('packageJson is not supported');
    }

    if (!('version' in packageJson)) {
      throw new Error('packageJson.version is required');
    }

    return packageJson.version as string;
  }

  /**
   * Checks the NPM authentication.
   *
   * @throws If the NPM token is not set.
   */
  async checkNpmAuth(): Promise<void> {
    const npmToken = this.env.get('NPM_TOKEN');

    if (!npmToken) {
      throw new Error('NPM_TOKEN is not set.');
    }

    this.setConfig({ npmToken });

    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${npmToken}" > .npmrc`
    );
  }

  /**
   * Checks the publish path.
   */
  async checkPublishPath(): Promise<void> {
    const publishPath = this.getPublishPath();

    this.switchToPublishPath(publishPath);

    this.logger.debug('Current path:', publishPath);
  }

  /**
   * Switches to the publish path.
   *
   * @param publishPath - The publish path.
   */
  switchToPublishPath(publishPath: string): void {
    if (publishPath && existsSync(publishPath)) {
      this.logger.debug('Switching to publish path:', publishPath);
      process.chdir(publishPath);
    }
  }

  /**
   * Gets the publish path for the release.
   *
   * @returns The publish path.
   */
  getPublishPath(): string {
    const publishPath = this.getConfig('publishPath');
    return typeof publishPath === 'string' ? publishPath : process.cwd();
  }
}
