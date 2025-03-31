import { existsSync } from 'node:fs';
import ReleaseContext from '../interface/ReleaseContext';
import Plugin from '../Plugin';

export default class PublishPath extends Plugin {
  readonly pluginName = 'publish-path';

  constructor(context: ReleaseContext) {
    super(context);
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('PublishPath onBefore');
    this.checkPublishPath();
  }

  /**
   * Checks the publish path.
   */
  async checkPublishPath(): Promise<void> {
    const publishPath = this.context.getConfig('publishPath') as string;

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
