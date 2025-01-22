import { ReleaseItInstanceOptions, ReleaseItInstanceType } from '../type';
import Plugin from '../Plugin';
import { existsSync } from 'fs';
import ReleaseContext from '../interface/ReleaseContext';
import isObject from 'lodash/isObject';
export default class PublishNpm extends Plugin {
  readonly pluginName = 'publish-npm';

  private _releaseItOutput?: ReleaseItInstanceOptions;

  constructor(context: ReleaseContext, releaseIt?: ReleaseItInstanceType) {
    super(context);

    if (!releaseIt) {
      throw new Error('releaseIt is not required');
    }

    this.setConfig({ releaseItInstance: releaseIt });

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

    await this.step({
      label: 'Publish to NPM',
      task: () => this.publish(publishOptions)
    });
  }

  /**
   * Executes the release-it process.
   *
   * use release-it to publish the package to npm
   *
   * @param releaseItOptions - Options for the release-it process.
   * @returns The output from the release-it process.
   */
  async publish(
    releaseItOptions: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.logger.debug('Run release-it method', releaseItOptions);

    const releaseItInstance = this.getConfig(
      'releaseItInstance'
    ) as ReleaseItInstanceType;

    if (!releaseItInstance) {
      throw new Error('releaseItInstance is not set');
    }

    this._releaseItOutput = await releaseItInstance(releaseItOptions);

    // return the output
    return this._releaseItOutput;
  }

  getPublishReleaseItOptions(
    context: ReleaseContext
  ): ReleaseItInstanceOptions {
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
    const npmToken = this.getEnv('NPM_TOKEN');

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
