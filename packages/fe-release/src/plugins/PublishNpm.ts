import type ReleaseContext from '../implments/ReleaseContext';
import type { ReleaseItInstanceResult } from '../implments/release-it/ReleaseIt';
import Plugin from './Plugin';

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

  /**
   * Executes the release-it process.
   *
   * use release-it to publish the package to npm
   *
   * @returns The output from the release-it process.
   */
  async publish(): Promise<ReleaseItInstanceResult | undefined> {
    return this.context.releaseIt.publishNpm();
  }

  /**
   * Checks the NPM authentication.
   *
   * @throws If the NPM token is not set.
   */
  async checkNpmAuth(): Promise<void> {
    const npmToken =
      (this.getConfig('npmToken') as string) || this.getEnv('NPM_TOKEN');

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
