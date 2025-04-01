import { existsSync } from 'node:fs';
import ReleaseContext from '../interface/ReleaseContext';
import Plugin from '../Plugin';

export default class PublishPath extends Plugin {
  constructor(context: ReleaseContext) {
    super(context, 'publish-path');
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('[before] PublishPath');
    this.checkPublishPath();
  }

  /**
   * Checks the publish path.
   */
  async checkPublishPath(): Promise<void> {
    const publishPath = this.context.getConfig(
      'environment.publishPath'
    ) as string;

    if (!publishPath) {
      throw new Error('publishPath is not set');
    }

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
}
