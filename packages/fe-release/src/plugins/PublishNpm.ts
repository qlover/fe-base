import type ReleaseContext from '../interface/ReleaseContext';
import Plugin from '../Plugin';
import type {
  ReleaseItInstanceOptions,
  ReleaseItInstanceResult
} from './release-it/ReleaseIt';
import merge from 'lodash/merge';

export interface PublishNpmProps {
  npmToken?: string;

  /**
   * Whether to skip setting the npmrc file
   *
   * @default `false`
   */
  skipNpmrc?: boolean;
}

export default class PublishNpm extends Plugin<PublishNpmProps> {
  private _releaseItOutput?: ReleaseItInstanceResult;

  constructor(context: ReleaseContext) {
    super(context, 'publishNpm');
  }

  enabled(): boolean {
    return !this.context.releasePR;
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
    await this.step({
      label: 'Publish to NPM',
      task: () => this.publish()
    });
  }

  private getPublishReleaseItOptions(): ReleaseItInstanceOptions {
    return merge(this.context.getConfig('releaseIt'), {
      ci: true,
      npm: {
        publish: true,
        publishPath: this.context.releasePackageName
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
      'dry-run': this.context.dryRun,
      verbose: true,
      increment: this.context.getPkg('version')
    });
  }

  /**
   * Executes the release-it process.
   *
   * use release-it to publish the package to npm
   *
   * @returns The output from the release-it process.
   */
  async publish(): Promise<ReleaseItInstanceResult | undefined> {
    const releaseItOptions = this.getPublishReleaseItOptions();
    this.logger.debug('Run release-it method', releaseItOptions);

    this._releaseItOutput = await this.context.runReleaseIt(releaseItOptions);

    // return the output
    return this._releaseItOutput;
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

    if (this.getConfig('skipNpmrc')) {
      this.logger.debug('skipNpmrc is true, skip set npmrc');
      return;
    }

    await this.shell.exec(
      `echo //registry.npmjs.org/:_authToken=${npmToken} > .npmrc`,
      {
        dryRun: false
      }
    );
  }
}
