import { existsSync } from 'fs';
import ReleaseContext from '../interface/ReleaseContext';
import Plugin from '../Plugin';

export default class PublishPath extends Plugin {
  readonly pluginName = 'publish-path';

  constructor(context: ReleaseContext) {
    super(context);
    this.checkPublishPath();
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('PublishPath onBefore');
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
