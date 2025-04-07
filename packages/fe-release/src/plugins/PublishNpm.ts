import { ReleaseItInstanceOptions, ReleaseItInstanceType } from '../type';
import Plugin from '../Plugin';
import ReleaseContext from '../interface/ReleaseContext';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';

export interface PublishNpmProps {
  npmToken?: string;
}

export default class PublishNpm extends Plugin<PublishNpmProps> {
  private _releaseItOutput?: ReleaseItInstanceOptions;

  constructor(context: ReleaseContext) {
    super(context, 'publish');

    this.getIncrementVersion();
  }

  enabled(): boolean {
    return !this.context.releasePR;
  }

  get releaseIt(): ReleaseItInstanceType {
    const releaseIt = this.context.options.releaseIt;

    if (!isFunction(releaseIt)) {
      throw new Error('releaseIt instance is not set');
    }

    return releaseIt;
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('PublishNpm onBefore');

    // check npm
    await this.checkNpmAuth();
  }

  /**
   * @override
   */
  async onExec(): Promise<void> {
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

    this._releaseItOutput = await this.releaseIt(releaseItOptions);

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
    const version = this.context.getPkg('version');

    if (!version || !isString(version)) {
      throw new Error('pkg.version is not set');
    }

    return version;
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
      `echo //registry.npmjs.org/:_authToken=${npmToken} > .npmrc`,
      {
        dryRun: false
      }
    );
  }
}
