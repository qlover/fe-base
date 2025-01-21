import { ExecutorPlugin } from '@qlover/fe-utils';
import { DeepPartial, ExecutorReleaseContext, ReleaseConfig } from './type';
import { ScriptsLogger, Shell } from '@qlover/scripts-context';
import ReleaseContext from './ReleaseContext';
import { Env } from '@qlover/env-loader';

export default abstract class Plugin implements ExecutorPlugin {
  abstract readonly pluginName: string;
  readonly onlyOne = true;

  constructor(protected context: ReleaseContext) {}

  get logger(): ScriptsLogger {
    return this.context.logger;
  }

  get shell(): Shell {
    return this.context.shell;
  }

  get env(): Env {
    return this.context.getEnv();
  }

  enabled(): boolean {
    return true;
  }

  /**
   * get reelase config
   */
  getConfig(keys: string | string[], defaultValue?: unknown): unknown {
    return this.context.getConfig(
      ['release', ...(Array.isArray(keys) ? keys : [keys])],
      defaultValue
    );
  }

  /**
   * set release config
   */
  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.context.setConfig(config);
  }

  onBefore?(_context: ExecutorReleaseContext): void | Promise<void> {}

  onSuccess?(_context: ExecutorReleaseContext): void | Promise<void> {}

  onError?(_context: ExecutorReleaseContext): void | Promise<void> {}
}
